import { Node } from '@tiptap/pm/model';
import dayjs from 'dayjs';
import { and, desc, eq, gt, inArray, notInArray, sql } from 'drizzle-orm';
import * as R from 'remeda';
import { yXmlFragmentToProseMirrorRootNode } from 'y-prosemirror';
import * as Y from 'yjs';
import {
  db,
  first,
  firstOrThrow,
  PageContentChunks,
  PageContentContributors,
  PageContents,
  PageContentSnapshots,
  PageContentStates,
  PageContentUpdates,
  Pages,
} from '@/db';
import { PageState } from '@/enums';
import * as openai from '@/external/openai';
import { schema } from '@/pm';
import { pubsub } from '@/pubsub';
import { searchIndex } from '@/search';
import { hashPageContent } from '@/utils/page';
import { enqueueJob } from './index';
import { defineJob } from './types';

export const PageContentStateUpdateJob = defineJob('page:content:state-update', async (pageId: string) => {
  const updated = await db.transaction(async (tx) => {
    const state = await tx
      .select({
        update: PageContentStates.update,
        vector: PageContentStates.vector,
        seq: PageContentStates.seq,
      })
      .from(PageContentStates)
      .where(eq(PageContentStates.pageId, pageId))
      .for('update')
      .then(firstOrThrow);

    const updates = await tx
      .select({ userId: PageContentUpdates.userId, update: PageContentUpdates.update, seq: PageContentUpdates.seq })
      .from(PageContentUpdates)
      .where(and(eq(PageContentUpdates.pageId, pageId), gt(PageContentUpdates.seq, state.seq)))
      .orderBy(desc(PageContentUpdates.seq));

    if (updates.length === 0) {
      return false;
    }

    const update = Y.mergeUpdatesV2(updates.map(({ update }) => update));
    const doc = new Y.Doc();

    Y.applyUpdateV2(doc, state.update);
    const prevSnapshot = Y.snapshot(doc);

    Y.applyUpdateV2(doc, update);
    const snapshot = Y.snapshot(doc);

    await tx
      .update(PageContentStates)
      .set({
        update: Y.encodeStateAsUpdateV2(doc),
        vector: Y.encodeStateVector(doc),
        seq: updates[0].seq,
      })
      .where(and(eq(PageContentStates.pageId, pageId)));

    if (Y.equalSnapshots(prevSnapshot, snapshot)) {
      return false;
    }

    await tx.insert(PageContentSnapshots).values({
      pageId,
      snapshot: Y.encodeSnapshotV2(snapshot),
    });

    const title = doc.getText('title').toString() || null;
    const subtitle = doc.getText('subtitle').toString() || null;
    const fragment = doc.getXmlFragment('content');

    const node = yXmlFragmentToProseMirrorRootNode(fragment, schema);
    const content = node.toJSON();
    const text = node.textBetween(0, node.content.size, '\n');

    await tx
      .update(PageContentStates)
      .set({
        title,
        subtitle,
        content,
        text,
        hash: hashPageContent({ title, subtitle, content }),
        updatedAt: dayjs(),
      })
      .where(and(eq(PageContentStates.pageId, pageId)));

    const uniqueContributorUserIds = R.unique(updates.map((update) => update.userId));
    await tx
      .insert(PageContentContributors)
      .values(uniqueContributorUserIds.map((userId) => ({ pageId, userId })))
      .onConflictDoUpdate({
        target: [PageContentContributors.pageId, PageContentContributors.userId],
        set: { updatedAt: sql`now()` },
      });

    await enqueueJob(tx, 'page:search:index-update', pageId);

    return true;
  });

  if (updated) {
    const page = await db.select({ siteId: Pages.siteId }).from(Pages).where(eq(Pages.id, pageId)).then(firstOrThrow);
    pubsub.publish('site:update', page.siteId, { scope: 'page', pageId });
  }
});

export const PageSearchIndexUpdateJob = defineJob('page:search:index-update', async (pageId: string) => {
  const index = searchIndex('pages');

  const { state } = await db.select({ state: Pages.state }).from(Pages).where(eq(Pages.id, pageId)).then(firstOrThrow);

  // eslint-disable-next-line unicorn/prefer-switch
  if (state === PageState.PUBLISHED) {
    const page = await db
      .select({
        id: Pages.id,
        siteId: Pages.siteId,
        state: Pages.state,
        title: PageContents.title,
        subtitle: PageContents.subtitle,
        text: PageContents.text,
      })
      .from(Pages)
      .innerJoin(PageContents, eq(Pages.id, PageContents.pageId))
      .where(eq(Pages.id, pageId))
      .then(firstOrThrow);

    await index.addDocuments([page]);
  } else if (state === PageState.DRAFT) {
    const page = await db
      .select({
        id: Pages.id,
        siteId: Pages.siteId,
        state: Pages.state,
        title: PageContentStates.title,
        subtitle: PageContentStates.subtitle,
        text: PageContentStates.text,
      })
      .from(Pages)
      .innerJoin(PageContentStates, eq(Pages.id, PageContentStates.pageId))
      .where(eq(Pages.id, pageId))
      .then(firstOrThrow);

    await index.addDocuments([page]);
  } else if (state === PageState.DELETED) {
    await index.deleteDocument(pageId);
  }
});

export const PageSummarizeJob = defineJob('page:summarize', async (pageId: string) => {
  const page = await db
    .select({
      title: PageContents.title,
      subtitle: PageContents.subtitle,
      content: PageContents.content,
      text: PageContents.text,
    })
    .from(Pages)
    .innerJoin(PageContents, eq(Pages.id, PageContents.pageId))
    .where(and(eq(Pages.id, pageId), eq(Pages.state, PageState.PUBLISHED)))
    .then(first);

  // 별다른 이유는 없지만 5글자도 안 되는 문서를 검색할 필요가 없지 않을까요...? 아님말구
  if (!page || page.text.length < 5) {
    return;
  }

  const content = Node.fromJSON(schema, page.content);

  const chunks: { str: string; hash: string }[] = [];

  if (page.title) {
    chunks.push({ str: page.title, hash: Bun.hash(page.title).toString() });
  }

  if (page.subtitle) {
    chunks.push({ str: page.subtitle, hash: Bun.hash(page.subtitle).toString() });
  }

  // 이건 Array의 forEach가 아니라구 ESLint 너가 몰알아???
  // eslint-disable-next-line unicorn/no-array-for-each
  content.forEach((node) => {
    const text = node.textBetween(0, node.content.size, '\n');
    if (text.length > 0) {
      chunks.push({ str: text, hash: Bun.hash(text).toString() });
    }
  });

  await db.transaction(async (tx) => {
    await tx.delete(PageContentChunks).where(
      and(
        eq(PageContentChunks.pageId, pageId),
        notInArray(
          PageContentChunks.hash,
          chunks.map((chunk) => chunk.hash),
        ),
      ),
    );

    const rows = await tx
      .select()
      .from(PageContentChunks)
      .where(
        inArray(
          PageContentChunks.hash,
          chunks.map((chunk) => chunk.hash),
        ),
      );
    const values = R.groupBy(rows, (row) => row.hash);

    await Promise.all(
      chunks
        .filter((chunk) => (values[chunk.hash]?.length ?? 0) === 0)
        .map(async (chunk) => {
          const vector = await openai.client.embeddings
            .create({
              input: chunk.str,
              model: 'text-embedding-3-small',
            })
            .then((response) => response.data[0].embedding);

          await tx
            .insert(PageContentChunks)
            .values({
              pageId,
              hash: chunk.hash,
              vector,
            })
            .onConflictDoNothing();
        }),
    );
  });
});
