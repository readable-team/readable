import { and, eq, gt } from 'drizzle-orm';
import { fromUint8Array, toUint8Array } from 'js-base64';
import * as Y from 'yjs';
import { z } from 'zod';
import { db, firstOrThrow, PageContentStates, PageContentUpdates } from '@/db';
import { PageContentSyncKind } from '@/enums';
import { enqueueJob } from '@/jobs';
import { pubsub } from '@/pubsub';
import { router, sessionProcedure } from '@/trpc';

export const pageRouter = router({
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
