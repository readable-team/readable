import dayjs from 'dayjs';
import { and, asc, eq, gt, lte } from 'drizzle-orm';
import { yXmlFragmentToProseMirrorRootNode } from 'y-prosemirror';
import * as Y from 'yjs';
import { db, firstOrThrow, PageContentSnapshots, PageContentStates, PageContentUpdates, Pages } from '@/db';
import { schema } from '@/pm';
import { pubsub } from '@/pubsub';
import { defineJob } from './types';

export const PageContentStateUpdateJob = defineJob('post:content:state-update', async (pageId: string) => {
  await db.transaction(async (tx) => {
    const state = await tx
      .select({
        update: PageContentStates.update,
        vector: PageContentStates.vector,
        upToSeq: PageContentStates.upToSeq,
      })
      .from(PageContentStates)
      .where(eq(PageContentStates.pageId, pageId))
      .for('update')
      .then(firstOrThrow);

    const pendingUpdates = await tx
      .select({ update: PageContentUpdates.update, seq: PageContentUpdates.seq })
      .from(PageContentUpdates)
      .where(and(eq(PageContentUpdates.pageId, pageId), gt(PageContentUpdates.seq, state.upToSeq)))
      .orderBy(asc(PageContentUpdates.seq));

    if (pendingUpdates.length === 0) {
      return;
    }

    const pendingUpdate = Y.mergeUpdatesV2(pendingUpdates.map(({ update }) => update));

    const doc = new Y.Doc({ gc: false });

    Y.applyUpdateV2(doc, state.update);
    const prevSnapshot = Y.snapshot(doc);

    Y.applyUpdateV2(doc, pendingUpdate);
    const snapshot = Y.snapshot(doc);

    if (!Y.equalSnapshots(prevSnapshot, snapshot)) {
      await tx.insert(PageContentSnapshots).values({
        pageId,
        snapshot: Y.encodeSnapshotV2(snapshot),
      });
    }

    const updatedUpdate = Y.encodeStateAsUpdateV2(doc);
    const updatedVector = Y.encodeStateVector(doc);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const updatedUpToSeq = pendingUpdates.at(-1)!.seq;

    const title = doc.getText('title').toString();
    const subtitle = doc.getText('subtitle').toString();

    const content = doc.getXmlFragment('content');
    const node = yXmlFragmentToProseMirrorRootNode(content, schema);

    await tx
      .update(PageContentStates)
      .set({
        update: updatedUpdate,
        vector: updatedVector,
        upToSeq: updatedUpToSeq,
        title: title.length > 0 ? title : null,
        subtitle: subtitle.length > 0 ? subtitle : null,
        content: node.toJSON(),
        text: node.content.textBetween(0, node.content.size, '\n'),
        updatedAt: dayjs(),
      })
      .where(eq(PageContentStates.pageId, pageId));

    await tx
      .delete(PageContentUpdates)
      .where(and(eq(PageContentUpdates.pageId, pageId), lte(PageContentUpdates.seq, updatedUpToSeq)));
  });

  const page = await db.select({ siteId: Pages.siteId }).from(Pages).where(eq(Pages.id, pageId)).then(firstOrThrow);
  pubsub.publish('site:update', page.siteId, { scope: 'page', pageId });
});
