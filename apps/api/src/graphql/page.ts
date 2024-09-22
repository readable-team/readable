import dayjs from 'dayjs';
import { and, asc, count, desc, eq, gt, inArray, isNull, ne, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { generateJitteredKeyBetween } from 'fractional-indexing-jittered';
import { base64 } from 'rfc4648';
import { match } from 'ts-pattern';
import * as Y from 'yjs';
import { builder } from '@/builder';
import {
  Categories,
  db,
  first,
  firstOrThrow,
  PageContentContributors,
  PageContents,
  PageContentStates,
  PageContentUpdates,
  Pages,
  PageViews,
} from '@/db';
import { CategoryState, PageContentSyncKind, PageState, TeamRestrictionType } from '@/enums';
import { enqueueJob } from '@/jobs';
import { schema } from '@/pm';
import { pubsub } from '@/pubsub';
import { hashPageContent, makeYDoc } from '@/utils/page';
import { assertCategoryPermission, assertPagePermission, assertSitePermission } from '@/utils/permissions';
import { assertTeamRestriction } from '@/utils/restrictions';
import {
  Category,
  ICategory,
  IPage,
  Page,
  PageContentContributor,
  PageContentState,
  PublicCategory,
  PublicPage,
  PublicPageContent,
  Site,
  User,
} from './objects';

/**
 * * Types
 */

ICategory.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),

    slug: t.exposeString('slug'),
    order: t.string({ resolve: (category) => decoder.decode(category.order) }),
  }),
});

Category.implement({
  interfaces: [ICategory],
  fields: (t) => ({
    pages: t.field({
      type: [Page],
      resolve: async (category, _, ctx) => {
        const loader = ctx.loader({
          name: 'Pages(categoryId).ne(DELETED).many',
          many: true,
          load: async (categoryIds: string[]) => {
            return await db
              .select()
              .from(Pages)
              .where(
                and(inArray(Pages.categoryId, categoryIds), ne(Pages.state, PageState.DELETED), isNull(Pages.parentId)),
              )
              .orderBy(asc(Pages.order));
          },
          key: (row) => row.categoryId,
        });

        return await loader.load(category.id);
      },
    }),

    recursivePageCount: t.int({
      resolve: async (category) => {
        return await db
          .select({ count: count(Pages.id) })
          .from(Pages)
          .where(and(eq(Pages.categoryId, category.id), ne(Pages.state, PageState.DELETED)))
          .then((rows) => rows[0]?.count ?? 0);
      },
    }),
  }),
});

PublicCategory.implement({
  interfaces: [ICategory],
  fields: (t) => ({
    pages: t.field({
      type: [PublicPage],
      resolve: async (category, _, ctx) => {
        const loader = ctx.loader({
          name: 'Pages(categoryId).eq(PUBLISHED).many',
          many: true,
          load: async (categoryIds: string[]) => {
            return await db
              .select()
              .from(Pages)
              .where(
                and(
                  inArray(Pages.categoryId, categoryIds),
                  eq(Pages.state, PageState.PUBLISHED),
                  isNull(Pages.parentId),
                ),
              )
              .orderBy(asc(Pages.order));
          },
          key: (row) => row.categoryId,
        });

        return await loader.load(category.id);
      },
    }),
  }),
});

IPage.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    state: t.expose('state', { type: PageState }),
    slug: t.exposeString('slug'),

    order: t.string({ resolve: (page) => decoder.decode(page.order) }),

    category: t.field({ type: Category, resolve: (page) => page.categoryId }),
  }),
});

Page.implement({
  interfaces: [IPage],
  fields: (t) => ({
    id: t.exposeID('id'),

    site: t.field({ type: Site, resolve: (page) => page.siteId }),

    content: t.field({
      type: PageContentState,
      resolve: async (page, _, ctx) => {
        const loader = ctx.loader({
          name: 'PageContentStates(pageId)',
          load: async (ids: string[]) => {
            return await db.select().from(PageContentStates).where(inArray(PageContentStates.pageId, ids));
          },
          key: (row) => row.pageId,
        });

        return await loader.load(page.id);
      },
    }),

    parent: t.field({ type: Page, nullable: true, resolve: (page) => page.parentId }),
    children: t.field({
      type: [Page],
      resolve: async (page, _, ctx) => {
        const loader = ctx.loader({
          name: 'Pages(parentId).ne(DELETED).many',
          many: true,
          load: async (parentIds: string[]) => {
            return await db
              .select()
              .from(Pages)
              .where(and(inArray(Pages.parentId, parentIds), ne(Pages.state, PageState.DELETED)))
              .orderBy(asc(Pages.order));
          },
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          key: (row) => row.parentId!,
        });

        return await loader.load(page.id);
      },
    }),

    contentContributor: t.field({
      type: [PageContentContributor],
      resolve: async (page) => {
        return await db
          .select()
          .from(PageContentContributors)
          .where(eq(PageContentContributors.pageId, page.id))
          .orderBy(desc(PageContentContributors.updatedAt));
      },
    }),

    hasUnpublishedChanges: t.boolean({
      resolve: async (page, _, ctx) => {
        const contentLoader = ctx.loader({
          name: 'PageContents(pageId) nullable',
          nullable: true,
          load: async (ids: string[]) => {
            return await db.select().from(PageContents).where(inArray(PageContents.pageId, ids));
          },
          key: (row) => row?.pageId,
        });

        const stateLoader = ctx.loader({
          name: 'PageContentStates(pageId)',
          load: async (ids: string[]) => {
            return await db.select().from(PageContentStates).where(inArray(PageContentStates.pageId, ids));
          },
          key: (row) => row.pageId,
        });

        const [pageContent, pageContentState] = await Promise.all([
          contentLoader.load(page.id),
          stateLoader.load(page.id),
        ]);

        if (!pageContent || pageContent.hash !== pageContentState.hash) {
          return true;
        }

        return false;
      },
    }),

    lastPublishedAt: t.field({
      type: 'DateTime',
      nullable: true,
      resolve: async (page, _, ctx) => {
        const loader = ctx.loader({
          name: 'PageContents(pageId) nullable',
          nullable: true,
          load: async (ids: string[]) => {
            return await db.select().from(PageContents).where(inArray(PageContents.pageId, ids));
          },
          key: (row) => row?.pageId,
        });

        return loader.load(page.id).then((content) => content?.updatedAt);
      },
    }),

    hasUnpublishedParents: t.boolean({
      resolve: async (page) => {
        if (!page.parentId) {
          return false;
        }

        const p = alias(Pages, 'p');

        const unpublishedParentsCount = await db
          .execute(
            sql<{ count: number }[]>`WITH RECURSIVE sq AS (
              SELECT ${Pages.id}, ${Pages.parentId}, ${Pages.state}
              FROM ${Pages}
              WHERE ${eq(Pages.id, page.parentId)}
              UNION ALL
              SELECT ${p.id}, ${p.parentId}, ${p.state}
              FROM pages AS p
              INNER JOIN sq ON ${p.id} = sq.parent_id
              WHERE ${ne(p.id, page.id)}
            )
            SELECT count(*) AS count
            FROM sq
            WHERE state != ${PageState.PUBLISHED};`,
          )
          .then((rows) => (rows[0].count ?? 0) as number);

        return unpublishedParentsCount > 0;
      },
    }),

    recursiveChildCount: t.int({
      resolve: async (page) => {
        const p = alias(Pages, 'p');

        const recursiveChildCount = await db
          .execute(
            sql<{ count: number }[]>`
          WITH RECURSIVE sq AS (
            SELECT ${Pages.id}, ${Pages.parentId}
            FROM ${Pages}
            WHERE ${eq(Pages.id, page.id)}
            UNION ALL
            SELECT ${p.id}, ${p.parentId}
            FROM pages AS p
            INNER JOIN sq ON ${p.parentId} = sq.id AND ${p.state} <> ${PageState.DELETED}
          )
          SELECT count(*) AS count
          FROM sq
          WHERE id <> ${page.id};
        `,
          )
          .then((rows) => (rows[0].count ?? 0) as number);

        return recursiveChildCount;
      },
    }),
  }),
});

PublicPage.implement({
  interfaces: [IPage],

  fields: (t) => ({
    content: t.field({
      type: PublicPageContent,
      resolve: async (page, _, ctx) => {
        const loader = ctx.loader({
          name: 'PageContents(pageId)',
          load: async (ids: string[]) => {
            return await db.select().from(PageContents).where(inArray(PageContents.pageId, ids));
          },
          key: (row) => row.pageId,
        });

        return await loader.load(page.id);
      },
    }),

    parent: t.field({ type: PublicPage, nullable: true, resolve: (page) => page.parentId }),
    children: t.field({
      type: [PublicPage],
      resolve: async (page, _, ctx) => {
        const loader = ctx.loader({
          name: 'Pages(parentId).eq(PUBLISHED).many',
          many: true,
          load: async (parentIds: string[]) => {
            return await db
              .select()
              .from(Pages)
              .where(and(inArray(Pages.parentId, parentIds), eq(Pages.state, PageState.PUBLISHED)))
              .orderBy(asc(Pages.order));
          },
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          key: (row) => row.parentId!,
        });

        return await loader.load(page.id);
      },
    }),
  }),
});

PageContentContributor.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),

    user: t.field({ type: User, resolve: (contributor) => contributor.userId }),
  }),
});

PageContentState.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),

    title: t.string({ resolve: (state) => state.title ?? '(제목 없음)' }),
    editorTitle: t.exposeString('title', { nullable: true }),
    subtitle: t.exposeString('subtitle', { nullable: true }),

    update: t.expose('update', { type: 'Binary' }),
    vector: t.expose('vector', { type: 'Binary' }),
  }),
});

const PageContentToc = builder.simpleObject('PageContentToc', {
  fields: (t) => ({
    anchorId: t.string(),
    title: t.string(),
    level: t.int(),
  }),
});

PublicPageContent.implement({
  fields: (t) => ({
    id: t.exposeID('id'),

    title: t.string({ resolve: (state) => state.title ?? '(제목 없음)' }),
    subtitle: t.exposeString('subtitle', { nullable: true }),

    content: t.expose('content', { type: 'JSON' }),

    excerpt: t.string({
      resolve: (content) => {
        return content.text.slice(0, 200);
      },
    }),

    tocs: t.field({
      type: [PageContentToc],
      resolve: (state) => {
        return (
          state.content.content
            ?.filter((content) => content.type === 'heading' && content.attrs?.anchorId)
            .map((content) => ({
              anchorId: content.attrs?.anchorId,
              title: content.content?.find((child) => child.type === 'text')?.text ?? '',
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              level: content.attrs!.level,
            })) ?? []
        );
      },
    }),
  }),
});

const PageContentSyncStreamPayload = builder.simpleObject('PageContentSyncStreamPayload', {
  fields: (t) => ({
    pageId: t.id(),
    kind: t.field({ type: PageContentSyncKind }),
    data: t.field({ type: 'Binary' }),
  }),
});

/**
 * * Queries
 */

builder.queryFields((t) => ({
  page: t.withAuth({ session: true }).field({
    type: Page,
    args: { pageId: t.arg.id() },
    resolve: async (_, args, ctx) => {
      await assertPagePermission({
        pageId: args.pageId,
        userId: ctx.session.userId,
      });

      return args.pageId;
    },
  }),

  publicPage: t.withAuth({ site: true }).field({
    type: PublicPage,
    args: { path: t.arg.string() },
    resolve: async (_, args, ctx) => {
      const slugs = args.path.split('/');
      const [categorySlug, parentSlug, pageSlug] = match(slugs.length)
        .with(2, () => [slugs[0], null, slugs[1]] as const)
        .with(3, () => [slugs[0], slugs[1], slugs[2]] as const)
        .run();

      const Pages2 = alias(Pages, 'p');

      const page = await db
        .select({ id: Pages.id })
        .from(Pages)
        .innerJoin(Categories, eq(Categories.id, Pages.categoryId))
        .leftJoin(Pages2, eq(Pages2.id, Pages.parentId))
        .where(
          and(
            eq(Pages.siteId, ctx.site.id),
            eq(Categories.slug, categorySlug),
            parentSlug ? eq(Pages2.slug, parentSlug) : isNull(Pages.parentId),
            eq(Pages.slug, pageSlug),
            eq(Categories.state, CategoryState.ACTIVE),
            eq(Pages.state, PageState.PUBLISHED),
          ),
        )
        .then(firstOrThrow);

      await assertTeamRestriction({
        pageId: page.id,
        type: TeamRestrictionType.USERSITE_READ,
      });

      return page.id;
    },
  }),
}));

/**
 * * Mutations
 */

builder.mutationFields((t) => ({
  createCategory: t.withAuth({ session: true }).fieldWithInput({
    type: Category,
    input: { siteId: t.input.id(), lower: t.input.id({ required: false }), upper: t.input.string({ required: false }) },
    resolve: async (_, { input }, ctx) => {
      await assertSitePermission({
        siteId: input.siteId,
        userId: ctx.session.userId,
      });

      await assertTeamRestriction({
        siteId: input.siteId,
        type: TeamRestrictionType.DASHBOARD_WRITE,
      });

      const category = await db
        .insert(Categories)
        .values({
          siteId: input.siteId,
          name: '새 카테고리',
          order: encoder.encode(generateJitteredKeyBetween(input.lower ?? null, input.upper ?? null)),
        })
        .returning()
        .then(firstOrThrow);

      pubsub.publish('site:update', input.siteId, { scope: 'site' });

      return category;
    },
  }),

  updateCategory: t.withAuth({ session: true }).fieldWithInput({
    type: Category,
    input: { categoryId: t.input.id(), name: t.input.string() },
    resolve: async (_, { input }, ctx) => {
      await assertCategoryPermission({
        categoryId: input.categoryId,
        userId: ctx.session.userId,
      });

      await assertTeamRestriction({
        categoryId: input.categoryId,
        type: TeamRestrictionType.DASHBOARD_WRITE,
      });

      const category = await db
        .update(Categories)
        .set({ name: input.name })
        .where(eq(Categories.id, input.categoryId))
        .returning()
        .then(firstOrThrow);

      pubsub.publish('site:update', category.siteId, { scope: 'site' });

      return category;
    },
  }),

  updateCategoryPosition: t.withAuth({ session: true }).fieldWithInput({
    type: Category,
    input: {
      categoryId: t.input.string(),
      lower: t.input.string({ required: false }),
      upper: t.input.string({ required: false }),
    },
    resolve: async (_, { input }, ctx) => {
      await assertCategoryPermission({
        categoryId: input.categoryId,
        userId: ctx.session.userId,
      });

      await assertTeamRestriction({
        categoryId: input.categoryId,
        type: TeamRestrictionType.DASHBOARD_WRITE,
      });

      const category = await db
        .update(Categories)
        .set({ order: encoder.encode(generateJitteredKeyBetween(input.lower ?? null, input.upper ?? null)) })
        .where(eq(Categories.id, input.categoryId))
        .returning()
        .then(firstOrThrow);

      pubsub.publish('site:update', category.siteId, { scope: 'site' });

      return category;
    },
  }),

  deleteCategory: t.withAuth({ session: true }).fieldWithInput({
    type: Category,
    input: { categoryId: t.input.id() },
    resolve: async (_, { input }, ctx) => {
      await assertCategoryPermission({
        categoryId: input.categoryId,
        userId: ctx.session.userId,
      });

      await assertTeamRestriction({
        categoryId: input.categoryId,
        type: TeamRestrictionType.DASHBOARD_WRITE,
      });

      let deletedPageIds: string[] = [];

      const category = await db.transaction(async (tx) => {
        deletedPageIds = await tx
          .update(Pages)
          .set({ state: PageState.DELETED })
          .where(eq(Pages.categoryId, input.categoryId))
          .returning({ id: Pages.id })
          .then((rows) => rows.map((row) => row.id));

        return await tx
          .update(Categories)
          .set({ state: CategoryState.DELETED })
          .where(eq(Categories.id, input.categoryId))
          .returning()
          .then(firstOrThrow);
      });

      pubsub.publish('site:update', category.siteId, { scope: 'site' });
      for (const pageId of deletedPageIds) {
        pubsub.publish('site:update', category.siteId, { scope: 'page', pageId });
      }

      return category;
    },
  }),

  createPage: t.withAuth({ session: true }).fieldWithInput({
    type: Page,
    input: { siteId: t.input.id(), parentId: t.input.id({ required: false }), categoryId: t.input.id() },
    resolve: async (_, { input }, ctx) => {
      await assertSitePermission({
        siteId: input.siteId,
        userId: ctx.session.userId,
      });

      await assertTeamRestriction({
        siteId: input.siteId,
        type: TeamRestrictionType.DASHBOARD_WRITE,
      });

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const node = schema.topNodeType.createAndFill()!;
      const content = node.toJSON();
      const text = node.content.textBetween(0, node.content.size, '\n');

      const doc = makeYDoc({
        title: null,
        subtitle: null,
        content,
      });

      const last = await db
        .select({ order: Pages.order })
        .from(Pages)
        .where(
          and(
            eq(Pages.siteId, input.siteId),
            eq(Pages.categoryId, input.categoryId),
            input.parentId ? eq(Pages.parentId, input.parentId) : isNull(Pages.parentId),
          ),
        )
        .orderBy(desc(Pages.order))
        .limit(1)
        .then(first);

      const page = await db.transaction(async (tx) => {
        const page = await tx
          .insert(Pages)
          .values({
            siteId: input.siteId,
            parentId: input.parentId,
            categoryId: input.categoryId,
            order: encoder.encode(generateJitteredKeyBetween(last ? decoder.decode(last.order) : null, null)),
            state: 'DRAFT',
          })
          .returning()
          .then(firstOrThrow);

        await tx.insert(PageContentStates).values({
          pageId: page.id,
          content,
          text,
          update: Y.encodeStateAsUpdateV2(doc),
          vector: Y.encodeStateVector(doc),
          hash: hashPageContent({ title: null, subtitle: null, content }),
        });

        await tx.insert(PageContentContributors).values({
          pageId: page.id,
          userId: ctx.session.userId,
        });

        await enqueueJob(tx, 'page:search:index-update', page.id);

        return page;
      });

      pubsub.publish('site:update', input.siteId, { scope: 'site' });

      return page;
    },
  }),

  deletePage: t.withAuth({ session: true }).fieldWithInput({
    type: Page,
    input: { pageId: t.input.id() },
    resolve: async (_, { input }, ctx) => {
      await assertPagePermission({
        pageId: input.pageId,
        userId: ctx.session.userId,
      });

      await assertTeamRestriction({
        pageId: input.pageId,
        type: TeamRestrictionType.DASHBOARD_WRITE,
      });

      const deletedPageIds = [input.pageId];

      const page = await db.transaction(async (tx) => {
        const page = await tx
          .update(Pages)
          .set({ state: 'DELETED' })
          .where(eq(Pages.id, input.pageId))
          .returning()
          .then(firstOrThrow);

        let deleteParentIds = [input.pageId];

        while (deleteParentIds.length > 0) {
          const deletedIds = await tx
            .update(Pages)
            .set({ state: 'DELETED' })
            .where(and(inArray(Pages.parentId, deleteParentIds), ne(Pages.state, 'DELETED')))
            .returning({ id: Pages.id })
            .then((rows) => rows.map((row) => row.id));

          deleteParentIds = deletedIds;
          deletedPageIds.push(...deletedIds);
        }

        await Promise.all(deletedPageIds.map((pageId) => enqueueJob(tx, 'page:search:index-update', pageId)));

        return page;
      });

      pubsub.publish('site:update', page.siteId, { scope: 'site' });
      for (const pageId of deletedPageIds) {
        pubsub.publish('site:update', page.siteId, { scope: 'page', pageId });
      }

      return page;
    },
  }),

  updatePagePosition: t.withAuth({ session: true }).fieldWithInput({
    type: Page,
    input: {
      pageId: t.input.string(),
      categoryId: t.input.string(),
      parentId: t.input.string({ required: false }),
      lower: t.input.string({ required: false }),
      upper: t.input.string({ required: false }),
    },
    resolve: async (_, { input }, ctx) => {
      await assertPagePermission({
        pageId: input.pageId,
        userId: ctx.session.userId,
      });

      await assertTeamRestriction({
        pageId: input.pageId,
        type: TeamRestrictionType.DASHBOARD_WRITE,
      });

      const page = await db
        .update(Pages)
        .set({
          order: encoder.encode(generateJitteredKeyBetween(input.lower ?? null, input.upper ?? null)),
          categoryId: input.categoryId,
          parentId: input.parentId ?? null,
        })
        .where(eq(Pages.id, input.pageId))
        .returning()
        .then(firstOrThrow);

      pubsub.publish('site:update', page.siteId, { scope: 'site' });

      return page;
    },
  }),

  publishPage: t.withAuth({ session: true }).fieldWithInput({
    type: Page,
    input: { pageId: t.input.id() },
    resolve: async (_, { input }, ctx) => {
      await assertPagePermission({
        pageId: input.pageId,
        userId: ctx.session.userId,
      });

      await assertTeamRestriction({
        pageId: input.pageId,
        type: TeamRestrictionType.DASHBOARD_WRITE,
      });

      const state = await db
        .select({
          title: PageContentStates.title,
          subtitle: PageContentStates.subtitle,
          content: PageContentStates.content,
          text: PageContentStates.text,
          hash: PageContentStates.hash,
        })
        .from(PageContentStates)
        .where(eq(PageContentStates.pageId, input.pageId))
        .then(firstOrThrow);

      const { content } = state;

      // 그니까 이건 Array.forEach 아니라니까 ESLint는 바보야 앨랠래
      // eslint-disable-next-line unicorn/no-array-for-each
      content.content?.forEach((child) => {
        if (child.type === 'heading' && !child.attrs?.anchorId) {
          const anchorId = encodeURIComponent(
            child.content
              ?.find((child) => child.type === 'text')
              ?.text?.trim()
              .toLowerCase()
              .replaceAll(' ', '-') ?? '',
          );

          if (anchorId.length > 0) {
            child.attrs = {
              ...child.attrs,
              anchorId,
            };
          }
        }
      });

      content.content = content.content?.filter((child) => {
        if (['image', 'file', 'embed'].includes(child.type ?? '') && !child.attrs?.id) {
          return false;
        }

        return true;
      });

      const page = await db.transaction(async (tx) => {
        const page = await tx
          .update(Pages)
          .set({ state: 'PUBLISHED' })
          .where(eq(Pages.id, input.pageId))
          .returning()
          .then(firstOrThrow);

        await tx
          .insert(PageContents)
          .values({
            pageId: page.id,
            title: state.title,
            subtitle: state.subtitle,
            content,
            text: state.text,
            hash: state.hash,
          })
          .onConflictDoUpdate({
            target: [PageContents.pageId],
            set: {
              title: state.title,
              subtitle: state.subtitle,
              content,
              text: state.text,
              hash: state.hash,
              updatedAt: dayjs(),
            },
          });

        await enqueueJob(tx, 'page:search:index-update', input.pageId);
        await enqueueJob(tx, 'page:summarize', page.id);

        return page;
      });

      pubsub.publish('site:update', page.siteId, { scope: 'page', pageId: page.id });

      return page;
    },
  }),

  unpublishPage: t.withAuth({ session: true }).fieldWithInput({
    type: Page,
    input: { pageId: t.input.id() },
    resolve: async (_, { input }, ctx) => {
      await assertPagePermission({
        pageId: input.pageId,
        userId: ctx.session.userId,
      });

      await assertTeamRestriction({
        pageId: input.pageId,
        type: TeamRestrictionType.DASHBOARD_WRITE,
      });

      const unpublishedPageIds = [input.pageId];

      const page = await db.transaction(async (tx) => {
        const page = await tx
          .update(Pages)
          .set({ state: 'DRAFT' })
          .where(eq(Pages.id, input.pageId))
          .returning()
          .then(firstOrThrow);

        let unpublishParentIds = [input.pageId];

        while (unpublishParentIds.length > 0) {
          const unpublishedIds = await tx
            .update(Pages)
            .set({ state: 'DRAFT' })
            .where(and(inArray(Pages.parentId, unpublishParentIds), ne(Pages.state, 'DELETED')))
            .returning({ id: Pages.id })
            .then((rows) => rows.map((row) => row.id));

          unpublishParentIds = unpublishedIds;
          unpublishedPageIds.push(...unpublishedIds);
        }

        await Promise.all(unpublishedPageIds.map((pageId) => enqueueJob(tx, 'page:search:index-update', pageId)));

        return page;
      });

      pubsub.publish('site:update', page.siteId, { scope: 'site' });

      return page;
    },
  }),

  syncPageContent: t.withAuth({ session: true }).fieldWithInput({
    type: 'Boolean',
    input: {
      pageId: t.input.id(),
      kind: t.input.field({ type: PageContentSyncKind }),
      data: t.input.field({ type: 'Binary' }),
    },
    resolve: async (_, { input }, ctx) => {
      await assertPagePermission({
        pageId: input.pageId,
        userId: ctx.session.userId,
      });

      await assertTeamRestriction({
        pageId: input.pageId,
        type: TeamRestrictionType.DASHBOARD_WRITE,
      });

      pubsub.publish('page:content:sync', input.pageId, {
        kind: input.kind,
        data: base64.stringify(input.data),
      });

      if (input.kind === PageContentSyncKind.UPDATE) {
        await db.transaction(async (tx) => {
          await tx.insert(PageContentUpdates).values({
            pageId: input.pageId,
            userId: ctx.session.userId,
            update: input.data,
          });

          await enqueueJob(tx, 'page:content:state-update', input.pageId);
        });
      }

      return true;
    },
  }),

  duplicatePage: t.withAuth({ session: true }).fieldWithInput({
    type: Page,
    input: { pageId: t.input.id() },
    resolve: async (_, { input }, ctx) => {
      await assertPagePermission({
        pageId: input.pageId,
        userId: ctx.session.userId,
      });

      await assertTeamRestriction({
        pageId: input.pageId,
        type: TeamRestrictionType.DASHBOARD_WRITE,
      });

      const page = await db.select().from(Pages).where(eq(Pages.id, input.pageId)).then(firstOrThrow);

      const nextPageOrder = await db
        .select({ order: Pages.order })
        .from(Pages)
        .where(gt(Pages.order, page.order))
        .orderBy(asc(Pages.order))
        .limit(1)
        .then((rows) => (rows[0]?.order ? decoder.decode(rows[0].order) : null));

      const state = await db
        .select({
          title: PageContentStates.title,
          subtitle: PageContentStates.subtitle,
          content: PageContentStates.content,
          text: PageContentStates.text,
          hash: PageContentStates.hash,
        })
        .from(PageContentStates)
        .where(eq(PageContentStates.pageId, input.pageId))
        .then(firstOrThrow);

      const title = `(사본) ${state.title ?? '(제목 없음)'}`;

      const doc = makeYDoc({
        title,
        subtitle: state.subtitle,
        content: state.content,
      });

      const newPage = await db.transaction(async (tx) => {
        const newPage = await tx
          .insert(Pages)
          .values({
            siteId: page.siteId,
            categoryId: page.categoryId,
            parentId: page.parentId,
            order: encoder.encode(generateJitteredKeyBetween(decoder.decode(page.order), nextPageOrder)),
            state: 'DRAFT',
          })
          .returning()
          .then(firstOrThrow);

        await tx.insert(PageContentStates).values({
          pageId: newPage.id,
          title,
          subtitle: state.subtitle,
          content: state.content,
          text: state.text,
          update: Y.encodeStateAsUpdateV2(doc),
          vector: Y.encodeStateVector(doc),
          hash: state.hash,
        });

        await tx.insert(PageContentContributors).values({
          pageId: newPage.id,
          userId: ctx.session.userId,
        });

        await enqueueJob(tx, 'page:search:index-update', newPage.id);

        return newPage;
      });

      pubsub.publish('site:update', page.siteId, { scope: 'site' });

      return newPage;
    },
  }),

  updatePageView: t.withAuth({ site: true }).fieldWithInput({
    type: 'Boolean',
    input: { pageId: t.input.id(), deviceId: t.input.string() },
    resolve: async (_, { input }) => {
      try {
        const pageView = await db
          .select({ id: PageViews.id })
          .from(PageViews)
          .where(
            and(
              eq(PageViews.pageId, input.pageId),
              eq(PageViews.deviceId, input.deviceId),
              gt(PageViews.createdAt, dayjs().subtract(1, 'day')),
            ),
          )
          .limit(1)
          .then(first);

        if (!pageView) {
          await db.insert(PageViews).values({
            pageId: input.pageId,
            deviceId: input.deviceId,
          });
        }
      } catch {
        /* empty */
      }

      return true;
    },
  }),
}));

/**
 * * Subscriptions
 */

builder.subscriptionFields((t) => ({
  pageContentSyncStream: t.withAuth({ session: true }).field({
    type: PageContentSyncStreamPayload,
    args: { pageId: t.arg.id() },
    subscribe: async (_, args, ctx) => {
      await assertPagePermission({
        pageId: args.pageId,
        userId: ctx.session.userId,
      });

      const repeater = pubsub.subscribe('page:content:sync', args.pageId);

      ctx.req.signal.addEventListener('abort', () => {
        repeater.return();
      });

      return repeater;
    },
    resolve: (payload, args) => ({
      pageId: args.pageId,
      kind: payload.kind,
      data: base64.parse(payload.data),
    }),
  }),
}));

/**
 * * Utils
 */

const encoder = new TextEncoder();
const decoder = new TextDecoder();
