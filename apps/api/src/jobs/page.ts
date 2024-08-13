import dayjs from 'dayjs';
import { and, asc, eq, gt, lte } from 'drizzle-orm';
import * as R from 'radash';
import { yXmlFragmentToProseMirrorRootNode } from 'y-prosemirror';
import * as Y from 'yjs';
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
} from '@/db';
import { PageState } from '@/enums';
import * as openai from '@/external/openai';
import { schema } from '@/pm';
import { pubsub } from '@/pubsub';
import { ms } from '@/search';
import { enqueueJob } from './index';
import { defineJob } from './types';

export const PageContentStateUpdateJob = defineJob('page:content:state-update', async (pageId: string) => {
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
      .select({ update: PageContentUpdates.update, seq: PageContentUpdates.seq, userId: PageContentUpdates.userId })
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
      const uniqueContributorUserIds = R.unique(pendingUpdates.map((update) => update.userId));

      await Promise.all([
        tx.insert(PageContentSnapshots).values({
          pageId,
          snapshot: Y.encodeSnapshotV2(snapshot),
        }),
        tx
          .insert(PageContentContributors)
          .values(uniqueContributorUserIds.map((userId) => ({ pageId, userId })))
          .onConflictDoUpdate({
            target: [PageContentContributors.pageId, PageContentContributors.userId],
            set: { updatedAt: dayjs() },
          }),
      ]);
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

  await enqueueJob('page:search:index-update', pageId);
});

export const PageSearchIndexUpdateJob = defineJob('page:search:index-update', async (pageId: string) => {
  const index = ms.index('pages');

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
      contentId: PageContents.id,
      title: PageContents.title,
      subtitle: PageContents.subtitle,
      text: PageContents.text,
    })
    .from(Pages)
    .innerJoin(PageContents, eq(Pages.id, PageContents.pageId))
    .where(and(eq(Pages.id, pageId), eq(Pages.state, PageState.PUBLISHED)))
    .then(first);

  if (!page) {
    return;
  }

  const result = await openai.client.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0,
    max_tokens: 256,
    frequency_penalty: 2,

    messages: [
      {
        role: 'system',
        content: `You are an assistant that summarizes end-user help center articles to make them more searchable in LLM. Summarize the content of the articles with keywords to make them easier to search and index. In particular, summarize the documentation by focusing on what methods it mainly presents. The output should only be a summary string in plain text. It doesn't need to be a natural sentence because we'll be using it as input to LLM, but it does need to be summarized enough for LLM to find the document. Do not output anything other than the summary. If there is nothing meaningful in the document, you don't need to output anything. The output language must match the language of the document.`,
      },
      { role: 'user', content: JSON.stringify({ title: page.title, subtitle: page.subtitle, text: page.text }) },
    ],
  });

  const summary = result.choices[0].message.content;

  await db
    .update(PageContents)
    .set({ summary: (summary?.length ?? 0) > 0 ? summary : null })
    .where(eq(PageContents.id, page.contentId));
});
