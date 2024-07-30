import { init } from '@paralleldrive/cuid2';
import { and, desc, eq, gt, inArray, isNull } from 'drizzle-orm';
import { generateJitteredKeyBetween } from 'fractional-indexing-jittered';
import { fromUint8Array, toUint8Array } from 'js-base64';
import * as R from 'radash';
import { prosemirrorToYDoc } from 'y-prosemirror';
import * as Y from 'yjs';
import { z } from 'zod';
import { db, first, firstOrThrow, PageContentSnapshots, PageContentStates, PageContentUpdates, Pages } from '@/db';
import { PageContentSyncKind } from '@/enums';
import { enqueueJob } from '@/jobs';
import { schema } from '@/pm';
import { pubsub } from '@/pubsub';
import { router, sessionProcedure } from '@/trpc';
import { assertSitePermission } from '@/utils/permissions';

const createPageSlug = init({ length: 8 });

export const pageRouter = router({
  create: sessionProcedure
    .input(z.object({ siteId: z.string(), parentId: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
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
            order: generateJitteredKeyBetween(last?.order ?? null, null),
            state: 'DRAFT',
          })
          .returning({ id: Pages.id, order: Pages.order })
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
    }),

  list: sessionProcedure
    .input(z.object({ siteId: z.string(), parentId: z.string().optional() }))
    .query(async ({ input, ctx }) => {
      await assertSitePermission({
        siteId: input.siteId,
        userId: ctx.session.userId,
      });

      return db
        .select({ id: Pages.id, state: Pages.state, order: Pages.order })
        .from(Pages)
        .where(
          and(
            eq(Pages.siteId, input.siteId),
            input.parentId ? eq(Pages.parentId, input.parentId) : isNull(Pages.parentId),
          ),
        )
        .orderBy(Pages.order);
    }),

  listRecursive: sessionProcedure.input(z.object({ siteId: z.string() })).query(async ({ input, ctx }) => {
    await assertSitePermission({
      siteId: input.siteId,
      userId: ctx.session.userId,
    });

    type PageObject = Pick<typeof Pages.$inferSelect, 'id' | 'state' | 'order' | 'slug' | 'parentId'> & {
      children: PageObject[];
    };

    const result = (await db
      .select({ id: Pages.id, state: Pages.state, order: Pages.order, slug: Pages.slug, parentId: Pages.parentId })
      .from(Pages)
      .where(and(eq(Pages.siteId, input.siteId), isNull(Pages.parentId)))
      .orderBy(Pages.order)) as PageObject[];

    const idToPageObjectRecord = R.objectify(result, (page) => page.id);
    let parentIds = result.map((page) => page.id);

    for (let recursiveAttempt = 0; recursiveAttempt < 10 && parentIds.length > 0; recursiveAttempt++) {
      const children = (await db
        .select({ id: Pages.id, state: Pages.state, order: Pages.order, slug: Pages.slug, parentId: Pages.parentId })
        .from(Pages)
        .where(inArray(Pages.parentId, parentIds))
        .orderBy(Pages.order)) as (PageObject & { parentId: string })[];

      if (children.length === 0) {
        break;
      }

      parentIds = children.map((page) => page.id);

      for (const child of children) {
        if (!idToPageObjectRecord[child.parentId].children) {
          idToPageObjectRecord[child.parentId].children = [];
        }

        idToPageObjectRecord[child.parentId].children.push(child);
        idToPageObjectRecord[child.id] = child;
      }
    }

    return result;
  }),

  content: router({
    sync: sessionProcedure
      .input(
        z.object({
          pageId: z.string(),
          clientId: z.string(),
          kind: z.nativeEnum(PageContentSyncKind),
          data: z.string(),
        }),
      )
      .mutation(async ({ input, ctx }) => {
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
      }),

    stream: sessionProcedure.input(z.object({ pageId: z.string() })).subscription(async ({ input }) => {
      return pubsub.subscribe('page:content:sync', input.pageId);
    }),
  }),
});

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
