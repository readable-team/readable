import { init } from '@paralleldrive/cuid2';
import { Node } from '@tiptap/pm/model';
import dayjs from 'dayjs';
import { and, asc, desc, eq, gt, inArray, isNull, ne } from 'drizzle-orm';
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
  PageContents,
  PageContentSnapshots,
  PageContentStates,
  PageContentUpdates,
  Pages,
} from '@/db';
import { PageContentSyncKind, PageState } from '@/enums';
import { enqueueJob } from '@/jobs';
import { schema } from '@/pm';
import { pubsub } from '@/pubsub';
import { assertPagePermission, assertSitePermission } from '@/utils/permissions';
import { IPage, Page, PageContentSnapshot, PageContentState, PublicPage, PublicPageContent, Site } from './objects';

/**
 * * Types
 */

IPage.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    state: t.expose('state', { type: PageState }),
    slug: t.exposeString('slug'),

    order: t.string({ resolve: (page) => decoder.decode(page.order) }),
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
  createPage: t.withAuth({ session: true }).fieldWithInput({
    type: Page,
    input: { siteId: t.input.id(), parentId: t.input.id({ required: false }) },
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
            input.parentId ? eq(Pages.parentId, input.parentId) : isNull(Pages.parentId),
          ),
        )
        .orderBy(desc(Pages.order))
        .limit(1)
        .then(first);

      const page = db.transaction(async (tx) => {
        const page = await tx
          .insert(Pages)
          .values({
            siteId: input.siteId,
            parentId: input.parentId,
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
        }

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
        }

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

        await db.insert(PageContentUpdates).values({
          pageId: input.pageId,
          userId: ctx.session.userId,
          update: toUint8Array(input.data),
        });

        await enqueueJob('post:content:state-update', input.pageId);
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

        await enqueueJob('post:content:state-update', input.pageId);

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
