import { init } from '@paralleldrive/cuid2';
import { Node } from '@tiptap/pm/model';
import dayjs from 'dayjs';
import { and, asc, desc, eq, gt, inArray, isNull, ne, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { generateJitteredKeyBetween } from 'fractional-indexing-jittered';
import { Repeater } from 'graphql-yoga';
import { fromUint8Array, toUint8Array } from 'js-base64';
import { prosemirrorToYDoc, yXmlFragmentToProseMirrorRootNode } from 'y-prosemirror';
import * as Y from 'yjs';
import { builder } from '@/builder';
import {
  db,
  first,
  firstOrThrow,
  PageContentContributors,
  PageContents,
  PageContentSnapshots,
  PageContentStates,
  PageContentUpdates,
  Pages,
  Sections,
} from '@/db';
import { PageContentSyncKind, PageState, SectionState } from '@/enums';
import { enqueueJob } from '@/jobs';
import { schema } from '@/pm';
import { pubsub } from '@/pubsub';
import { assertPagePermission, assertSectionPermission, assertSitePermission } from '@/utils/permissions';
import {
  IPage,
  ISection,
  Page,
  PageContentContributor,
  PageContentSnapshot,
  PageContentState,
  PublicPage,
  PublicPageContent,
  PublicSection,
  Section,
  Site,
  User,
} from './objects';

/**
 * * Types
 */

ISection.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),

    order: t.string({ resolve: (section) => decoder.decode(section.order) }),
  }),
});

Section.implement({
  interfaces: [ISection],
  fields: (t) => ({
    pages: t.field({
      type: [Page],
      resolve: async (section, _, ctx) => {
        const loader = ctx.loader({
          name: 'Pages(sectionId).ne(DELETED).many',
          many: true,
          load: async (sectionIds: string[]) => {
            return await db
              .select()
              .from(Pages)
              .where(
                and(inArray(Pages.sectionId, sectionIds), ne(Pages.state, PageState.DELETED), isNull(Pages.parentId)),
              );
          },
          key: (row) => row.sectionId,
        });

        return await loader.load(section.id);
      },
    }),
  }),
});

PublicSection.implement({
  interfaces: [ISection],
  fields: (t) => ({
    Pages: t.field({
      type: [PublicPage],
      resolve: async (section, _, ctx) => {
        const loader = ctx.loader({
          name: 'Pages(sectionId).eq(PUBLISHED).many',
          many: true,
          load: async (sectionIds: string[]) => {
            return await db
              .select()
              .from(Pages)
              .where(
                and(inArray(Pages.sectionId, sectionIds), eq(Pages.state, PageState.PUBLISHED), isNull(Pages.parentId)),
              );
          },
          key: (row) => row.sectionId,
        });

        return await loader.load(section.id);
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

    section: t.field({ type: Section, resolve: (page) => page.sectionId }),
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
      resolve: async (page) => {
        return await db
          .select()
          .from(Pages)
          .where(and(eq(Pages.parentId, page.id), ne(Pages.state, PageState.DELETED)))
          .orderBy(asc(Pages.order));
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

        if (
          !pageContent ||
          pageContent.title !== pageContentState.title ||
          pageContent.subtitle !== pageContentState.subtitle
        ) {
          return true;
        }

        return !Node.fromJSON(schema, pageContent.content).eq(Node.fromJSON(schema, pageContentState.content));
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
      resolve: async (page) => {
        return await db
          .select()
          .from(Pages)
          .where(and(eq(Pages.parentId, page.id), eq(Pages.state, PageState.PUBLISHED)))
          .orderBy(asc(Pages.order));
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
      return await db.select().from(Pages).where(eq(Pages.slug, args.slug)).then(firstOrThrow);
    },
  }),
}));

/**
 * * Mutations
 */

builder.mutationFields((t) => ({
  createSection: t.withAuth({ session: true }).fieldWithInput({
    type: Section,
    input: { siteId: t.input.id(), lower: t.input.id({ required: false }), upper: t.input.string({ required: false }) },
    resolve: async (_, { input }, ctx) => {
      await assertSitePermission({
        siteId: input.siteId,
        userId: ctx.session.userId,
      });

      const section = await db
        .insert(Sections)
        .values({
          siteId: input.siteId,
          name: '',
          order: encoder.encode(generateJitteredKeyBetween(input.lower ?? null, input.upper ?? null)),
        })
        .returning()
        .then(firstOrThrow);

      pubsub.publish('site:update', input.siteId, { scope: 'site' });

      return section;
    },
  }),

  updateSection: t.withAuth({ session: true }).fieldWithInput({
    type: Section,
    input: { sectionId: t.input.id(), name: t.input.string() },
    resolve: async (_, { input }, ctx) => {
      await assertSectionPermission({
        sectionId: input.sectionId,
        userId: ctx.session.userId,
      });

      const section = await db
        .update(Sections)
        .set({ name: input.name })
        .where(eq(Sections.id, input.sectionId))
        .returning()
        .then(firstOrThrow);

      pubsub.publish('site:update', section.siteId, { scope: 'site' });

      return section;
    },
  }),

  updateSectionPosition: t.withAuth({ session: true }).fieldWithInput({
    type: Section,
    input: {
      sectionId: t.input.string(),
      lower: t.input.string({ required: false }),
      upper: t.input.string({ required: false }),
    },
    resolve: async (_, { input }, ctx) => {
      await assertSectionPermission({
        sectionId: input.sectionId,
        userId: ctx.session.userId,
      });

      const section = await db
        .update(Sections)
        .set({ order: encoder.encode(generateJitteredKeyBetween(input.lower ?? null, input.upper ?? null)) })
        .where(eq(Sections.id, input.sectionId))
        .returning()
        .then(firstOrThrow);

      pubsub.publish('site:update', section.siteId, { scope: 'site' });

      return section;
    },
  }),

  deleteSection: t.withAuth({ session: true }).fieldWithInput({
    type: Section,
    input: { sectionId: t.input.id() },
    resolve: async (_, { input }, ctx) => {
      await assertSectionPermission({
        sectionId: input.sectionId,
        userId: ctx.session.userId,
      });

      const section = await db.transaction(async (tx) => {
        await tx.update(Pages).set({ state: PageState.DELETED }).where(eq(Pages.sectionId, input.sectionId));

        return await tx
          .update(Sections)
          .set({ state: SectionState.DELETED })
          .where(eq(Sections.id, input.sectionId))
          .returning()
          .then(firstOrThrow);
      });

      pubsub.publish('site:update', section.siteId, { scope: 'site' });

      return section;
    },
  }),

  createPage: t.withAuth({ session: true }).fieldWithInput({
    type: Page,
    input: { siteId: t.input.id(), parentId: t.input.id({ required: false }), sectionId: t.input.id() },
    resolve: async (_, { input }, ctx) => {
      await assertSitePermission({
        siteId: input.siteId,
        userId: ctx.session.userId,
      });

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const node = schema.topNodeType.createAndFill()!;

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
            eq(Pages.sectionId, input.sectionId),
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
            sectionId: input.sectionId,
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
          content: node.toJSON(),
          text: node.content.textBetween(0, node.content.size, '\n'),
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

        return page;
      });

      pubsub.publish('site:update', input.siteId, { scope: 'site' });

      await enqueueJob('page:search:index-update', page.id);

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

        return page;
      });

      pubsub.publish('site:update', page.siteId, { scope: 'site' });

      await Promise.all(deletedPageIds.map((pageId) => enqueueJob('page:search:index-update', pageId)));

      return page;
    },
  }),

  updatePagePosition: t.withAuth({ session: true }).fieldWithInput({
    type: Page,
    input: {
      pageId: t.input.string(),
      sectionId: t.input.string(),
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
          sectionId: input.sectionId,
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
            content: node.toJSON(),
            text,
          })
          .onConflictDoUpdate({
            target: [PageContents.pageId],
            set: {
              title: title.length > 0 ? title : null,
              subtitle: subtitle.length > 0 ? subtitle : null,
              content: node.toJSON(),
              text,
              updatedAt: dayjs(),
            },
          });

        return page;
      });

      pubsub.publish('site:update', page.siteId, { scope: 'page', pageId: page.id });

      await enqueueJob('page:search:index-update', input.pageId);
      await enqueueJob('page:summarize', page.id);

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

        return page;
      });

      pubsub.publish('site:update', page.siteId, { scope: 'site' });

      await Promise.all(unpublishedPageIds.map((pageId) => enqueueJob('page:search:index-update', pageId)));

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

        await db.insert(PageContentUpdates).values({
          pageId: input.pageId,
          userId: ctx.session.userId,
          update: toUint8Array(input.data),
        });

        await enqueueJob('page:content:state-update', input.pageId);
      } else if (input.kind === 'SYNCHRONIZE_1') {
        const state = await getLatestPageContentState(input.pageId);

        const clientStateVector = toUint8Array(input.data);
        const clientMissingUpdate = Y.diffUpdateV2(state.update, clientStateVector);
        const serverStateVector = state.vector;

        return [
          {
            pageId: input.pageId,
            kind: 'SYNCHRONIZE_2',
            data: fromUint8Array(clientMissingUpdate),
          },
          {
            pageId: input.pageId,
            kind: 'SYNCHRONIZE_1',
            data: fromUint8Array(serverStateVector),
          },
        ] as const;
      } else if (input.kind == 'SYNCHRONIZE_2') {
        pubsub.publish('page:content:sync', input.pageId, {
          pageId: input.pageId,
          kind: 'UPDATE',
          data: input.data,
        });

        const serverMissingUpdate = toUint8Array(input.data);

        await db.insert(PageContentUpdates).values({
          pageId: input.pageId,
          userId: ctx.session.userId,
          update: serverMissingUpdate,
        });

        await enqueueJob('page:content:state-update', input.pageId);

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
            sectionId: page.sectionId,
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
          content: node.toJSON(),
          text,
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

        return newPage;
      });

      pubsub.publish('site:update', page.siteId, { scope: 'site' });

      await enqueueJob('page:search:index-update', newPage.id);

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

/**
 * * Utils
 */

const createPageSlug = init({ length: 8 });
const encoder = new TextEncoder();
const decoder = new TextDecoder();
