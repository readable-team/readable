import { init } from '@paralleldrive/cuid2';
import dayjs from 'dayjs';
import { and, asc, desc, eq, gt, inArray, isNull, ne } from 'drizzle-orm';
import { generateJitteredKeyBetween } from 'fractional-indexing-jittered';
import { Repeater } from 'graphql-yoga';
import { fromUint8Array, toUint8Array } from 'js-base64';
import { prosemirrorToYDoc } from 'y-prosemirror';
import * as Y from 'yjs';
import { builder } from '@/builder';
import { db, first, firstOrThrow, PageContentSnapshots, PageContentStates, PageContentUpdates, Pages } from '@/db';
import { PageContentSyncKind, PageState } from '@/enums';
import { enqueueJob } from '@/jobs';
import { schema } from '@/pm';
import { pubsub } from '@/pubsub';
import { assertPagePermission, assertSitePermission } from '@/utils/permissions';
import { Page, PageContentSnapshot, PageContentState } from './objects';

/**
 * * Types
 */

Page.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    state: t.expose('state', { type: PageState }),

    order: t.string({ resolve: (page) => decoder.decode(page.order) }),

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

      return await db.transaction(async (tx) => {
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
          upToSeq: 0n,
        });

        await tx.insert(PageContentSnapshots).values({
          pageId: page.id,
          snapshot,
        });

        return page;
      });
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

      await db.transaction(async (tx) => {
        await tx.update(Pages).set({ state: 'DELETED' }).where(eq(Pages.id, input.pageId));

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
      });

      return input.pageId;
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

      return await db
        .update(Pages)
        .set({
          order: encoder.encode(generateJitteredKeyBetween(input.lower ?? null, input.upper ?? null)),
          parentId: input.parentId ?? null,
        })
        .where(eq(Pages.id, input.pageId))
        .returning()
        .then(firstOrThrow);
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
    subscribe: (_, args, ctx) => {
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
    resolve: (payload) => {
      return payload;
    },
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
