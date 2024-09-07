import { init } from '@paralleldrive/cuid2';
import dayjs from 'dayjs';
import { and, asc, desc, eq, gt, inArray, isNull, ne, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { generateJitteredKeyBetween } from 'fractional-indexing-jittered';
import { Repeater } from 'graphql-yoga';
import { base64 } from 'rfc4648';
import { prosemirrorToYDoc, yXmlFragmentToProseMirrorRootNode } from 'y-prosemirror';
import * as Y from 'yjs';
import { builder } from '@/builder';
import {
  Categories,
  db,
  first,
  firstOrThrow,
  PageContentContributors,
  PageContents,
  PageContentSnapshots,
  PageContentStates,
  PageContentUpdates,
  Pages,
} from '@/db';
import { CategoryState, PageContentSyncKind, PageState } from '@/enums';
import { enqueueJob } from '@/jobs';
import { schema } from '@/pm';
import { pubsub } from '@/pubsub';
import { hashPageContent } from '@/utils/page';
import { assertCategoryPermission, assertPagePermission, assertSitePermission } from '@/utils/permissions';
import {
  Category,
  ICategory,
  IPage,
  Page,
  PageContentContributor,
  PageContentSnapshot,
  PageContentState,
  PublicCategory,
  PublicPage,
  PublicPageContent,
  Site,
  User,
} from './objects';
import type { JSONContent } from '@tiptap/core';

/**
 * * Types
 */

ICategory.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),

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

PageContentSnapshot.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
  }),
});

PageContentState.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),

    title: t.string({ resolve: (state) => state.title ?? '(제목 없음)' }),
  }),
});

PublicPageContent.implement({
  fields: (t) => ({
    id: t.exposeID('id'),

    title: t.string({ resolve: (state) => state.title ?? '(제목 없음)' }),
    subtitle: t.exposeString('subtitle', { nullable: true }),

    content: t.expose('content', { type: 'JSON' }),
  }),
});

const PageContentSyncOperation = builder.simpleObject('PageContentSyncOperation', {
  fields: (t) => ({
    pageId: t.id(),
    kind: t.field({ type: PageContentSyncKind }),
    data: t.string(),
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

  publicPage: t.field({
    type: PublicPage,
    args: { slug: t.arg.string() },
    resolve: async (_, args) => {
      return await db
        .select()
        .from(Pages)
        .where(and(eq(Pages.slug, args.slug), eq(Pages.state, PageState.PUBLISHED)))
        .then(firstOrThrow);
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

      const category = await db.transaction(async (tx) => {
        await tx.update(Pages).set({ state: PageState.DELETED }).where(eq(Pages.categoryId, input.categoryId));

        return await tx
          .update(Categories)
          .set({ state: CategoryState.DELETED })
          .where(eq(Categories.id, input.categoryId))
          .returning()
          .then(firstOrThrow);
      });

      pubsub.publish('site:update', category.siteId, { scope: 'site' });

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

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const node = schema.topNodeType.createAndFill()!;
      const content = node.toJSON();
      const text = node.content.textBetween(0, node.content.size, '\n');

      const doc = prosemirrorToYDoc(node, 'content');
      const update = Y.encodeStateAsUpdateV2(doc);
      const vector = Y.encodeStateVector(doc);
      const snapshot = Y.encodeSnapshotV2(Y.snapshot(doc));

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
            slug: createPageSlug(),
            order: encoder.encode(generateJitteredKeyBetween(last ? decoder.decode(last.order) : null, null)),
            state: 'DRAFT',
          })
          .returning()
          .then(firstOrThrow);

        await tx.insert(PageContentStates).values({
          pageId: page.id,
          update,
          vector,
          content,
          text,
          hash: hashPageContent({ title: null, subtitle: null, content }),
          upToSeq: 0n,
        });

        await tx.insert(PageContentSnapshots).values({
          pageId: page.id,
          snapshot,
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

      const state = await getLatestPageContentState(input.pageId);

      const doc = new Y.Doc();
      Y.applyUpdateV2(doc, state.update);

      const title = doc.getText('title').toString();
      const subtitle = doc.getText('subtitle').toString();

      const content = doc.getXmlFragment('content');
      const node = yXmlFragmentToProseMirrorRootNode(content, schema);
      const text = node.content.textBetween(0, node.content.size, '\n');

      const jsonContent: JSONContent = node.toJSON();
      const hash = hashPageContent({ title, subtitle, content: jsonContent });

      // 그니까 이건 Array.forEach 아니라니까 ESLint는 바보야 앨랠래
      // eslint-disable-next-line unicorn/no-array-for-each
      jsonContent.content?.forEach((child) => {
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

      jsonContent.content = jsonContent.content?.filter((child) => {
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
            title: title.length > 0 ? title : null,
            subtitle: subtitle.length > 0 ? subtitle : null,
            content: jsonContent,
            text,
            hash,
          })
          .onConflictDoUpdate({
            target: [PageContents.pageId],
            set: {
              title: title.length > 0 ? title : null,
              subtitle: subtitle.length > 0 ? subtitle : null,
              content: jsonContent,
              text,
              hash,
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
    type: [PageContentSyncOperation],
    input: {
      pageId: t.input.id(),
      clientId: t.input.string(),
      kind: t.input.field({ type: PageContentSyncKind }),
      data: t.input.string(),
    },
    resolve: async (_, { input }, ctx) => {
      if (input.kind === 'UPDATE') {
        pubsub.publish('page:content:sync', input.pageId, {
          pageId: input.pageId,
          kind: 'UPDATE',
          data: input.data,
        });

        await db.transaction(async (tx) => {
          await tx.insert(PageContentUpdates).values({
            pageId: input.pageId,
            userId: ctx.session.userId,
            update: base64.parse(input.data),
          });

          await enqueueJob(tx, 'page:content:state-update', input.pageId);
        });
      } else if (input.kind === 'SYNCHRONIZE_1') {
        const state = await getLatestPageContentState(input.pageId);

        const clientStateVector = base64.parse(input.data);
        const clientMissingUpdate = Y.diffUpdateV2(state.update, clientStateVector);
        const serverStateVector = state.vector;

        return [
          {
            pageId: input.pageId,
            kind: 'SYNCHRONIZE_2',
            data: base64.stringify(clientMissingUpdate),
          },
          {
            pageId: input.pageId,
            kind: 'SYNCHRONIZE_1',
            data: base64.stringify(serverStateVector),
          },
        ] as const;
      } else if (input.kind == 'SYNCHRONIZE_2') {
        pubsub.publish('page:content:sync', input.pageId, {
          pageId: input.pageId,
          kind: 'UPDATE',
          data: input.data,
        });

        const serverMissingUpdate = base64.parse(input.data);

        await db.transaction(async (tx) => {
          await tx.insert(PageContentUpdates).values({
            pageId: input.pageId,
            userId: ctx.session.userId,
            update: serverMissingUpdate,
          });

          await enqueueJob(tx, 'page:content:state-update', input.pageId);
        });

        pubsub.publish('page:content:sync', input.pageId, {
          pageId: input.pageId,
          kind: 'SYNCHRONIZE_3',
          data: input.clientId,
        });
      } else if (input.kind === 'AWARENESS') {
        pubsub.publish('page:content:sync', input.pageId, {
          pageId: input.pageId,
          kind: 'AWARENESS',
          data: input.data,
        });
      }

      return [];
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

      const page = await db.select().from(Pages).where(eq(Pages.id, input.pageId)).then(firstOrThrow);

      const nextPageOrder = await db
        .select({ order: Pages.order })
        .from(Pages)
        .where(gt(Pages.order, page.order))
        .orderBy(asc(Pages.order))
        .limit(1)
        .then((rows) => (rows[0]?.order ? decoder.decode(rows[0].order) : null));

      const { update } = await getLatestPageContentState(input.pageId);

      const doc = new Y.Doc();
      Y.applyUpdateV2(doc, update);

      const node = yXmlFragmentToProseMirrorRootNode(doc.getXmlFragment('content'), schema);
      const content = node.toJSON();
      const text = node.content.textBetween(0, node.content.size, '\n');

      const title = `(사본) ${doc.getText('title').toString() || '(제목 없음)'}`;
      const subtitle = doc.getText('subtitle').toString();

      const newDoc = prosemirrorToYDoc(node, 'content');
      newDoc.getText('title').insert(0, title);
      newDoc.getText('subtitle').insert(0, subtitle);

      const newUpdate = Y.encodeStateAsUpdateV2(newDoc);
      const newVector = Y.encodeStateVector(newDoc);

      const snapshot = Y.encodeSnapshotV2(Y.snapshot(newDoc));

      const newPage = await db.transaction(async (tx) => {
        const newPage = await tx
          .insert(Pages)
          .values({
            siteId: page.siteId,
            categoryId: page.categoryId,
            parentId: page.parentId,
            slug: createPageSlug(),
            order: encoder.encode(generateJitteredKeyBetween(decoder.decode(page.order), nextPageOrder)),
            state: 'DRAFT',
          })
          .returning()
          .then(firstOrThrow);

        await tx.insert(PageContentStates).values({
          pageId: newPage.id,
          update: newUpdate,
          vector: newVector,
          title,
          subtitle: subtitle.length > 0 ? subtitle : null,
          content,
          text,
          hash: hashPageContent({ title, subtitle, content }),
          upToSeq: 0n,
        });

        await tx.insert(PageContentSnapshots).values({
          pageId: newPage.id,
          snapshot,
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
}));

/**
 * * Subscriptions
 */

builder.subscriptionFields((t) => ({
  pageContentSyncStream: t.withAuth({ session: true }).field({
    type: PageContentSyncOperation,
    args: { pageId: t.arg.id() },
    subscribe: async (_, args, ctx) => {
      assertPagePermission({
        pageId: args.pageId,
        userId: ctx.session.userId,
      });

      const repeater = Repeater.merge([
        pubsub.subscribe('page:content:sync', args.pageId),
        new Repeater<typeof PageContentSyncOperation.$inferType>(async (push, stop) => {
          const timer = setInterval(() => {
            push({ pageId: args.pageId, kind: PageContentSyncKind.PING, data: dayjs().unix().toString() });
          }, 1000);
          await stop;
          clearInterval(timer);
        }),
      ]);

      ctx.req.signal.addEventListener('abort', () => {
        repeater.return();
      });

      return repeater;
    },
    resolve: (payload) => payload,
  }),
}));

/**
 * * Utils
 */

const createPageSlug = init({ length: 8 });
const encoder = new TextEncoder();
const decoder = new TextDecoder();

const getLatestPageContentState = async (pageId: string) => {
  const state = await db
    .select({ update: PageContentStates.update, vector: PageContentStates.vector, upToSeq: PageContentStates.upToSeq })
    .from(PageContentStates)
    .where(eq(PageContentStates.pageId, pageId))
    .then(firstOrThrow);

  const pendingUpdates = await db
    .select({ update: PageContentUpdates.update })
    .from(PageContentUpdates)
    .where(and(eq(PageContentUpdates.pageId, pageId), gt(PageContentUpdates.seq, state.upToSeq)));

  if (pendingUpdates.length === 0) {
    return {
      update: state.update,
      vector: state.vector,
    };
  }

  const updatedUpdate = Y.mergeUpdatesV2([state.update, ...pendingUpdates.map(({ update }) => update)]);
  const updatedVector = Y.encodeStateVectorFromUpdateV2(updatedUpdate);

  return {
    update: updatedUpdate,
    vector: updatedVector,
  };
};
