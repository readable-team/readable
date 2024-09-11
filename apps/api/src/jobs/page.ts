import { Node } from '@tiptap/pm/model';
import { Mapping, Step, Transform } from '@tiptap/pm/transform';
import { and, asc, eq, gt, inArray, notInArray } from 'drizzle-orm';
import * as R from 'remeda';
import {
  db,
  first,
  firstOrThrow,
  PageContentChunks,
  PageContentCommits,
  PageContents,
  PageContentStates,
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

export const PageContentStateUpdateJob = defineJob('page:content:state-update', async (commitId: string) => {
  const commit = await db.transaction(async (tx) => {
    const commit = await tx
      .select({
        pageId: PageContentCommits.pageId,
        version: PageContentCommits.version,
        ref: PageContentCommits.ref,
        steps: PageContentCommits.steps,
      })
      .from(PageContentCommits)
      .where(eq(PageContentCommits.id, commitId))
      .then(firstOrThrow);

    const state = await tx
      .select({
        title: PageContentStates.title,
        subtitle: PageContentStates.subtitle,
        version: PageContentStates.version,
        content: PageContentStates.content,
      })
      .from(PageContentStates)
      .where(eq(PageContentStates.pageId, commit.pageId))
      .for('update')
      .then(firstOrThrow);

    const newerCommits = await tx
      .select({ steps: PageContentCommits.steps })
      .from(PageContentCommits)
      .where(and(eq(PageContentCommits.pageId, commit.pageId), gt(PageContentCommits.version, commit.version)))
      .orderBy(asc(PageContentCommits.version));

    const node = Node.fromJSON(schema, state.content);

    const newerSteps = newerCommits.flatMap((commit) => Step.fromJSON(schema, commit.steps));
    const newerMapping = new Mapping(newerSteps.map((s) => s.getMap()));

    const steps = commit.steps.map((step) => Step.fromJSON(schema, step));
    const mapping = new Mapping(steps.map((s) => s.getMap())).invert();

    mapping.appendMapping(newerMapping);

    const tr = new Transform(node);

    let from = steps.length;
    for (const step of steps) {
      const slice = mapping.slice(from--);
      // eslint-disable-next-line unicorn/no-array-callback-reference
      const mapped = step.map(slice);

      if (mapped && tr.maybeStep(mapped).doc) {
        mapping.appendMapping(new Mapping(tr.mapping.maps.slice(tr.steps.length - 1)));
        // @ts-expect-error ProseMirror internal
        mapping.setMirror(from, mapping.maps.length - 1);
      }
    }

    const content = tr.doc.toJSON();

    await tx
      .update(PageContentStates)
      .set({
        content,
        version: state.version + 1,
        hash: hashPageContent({
          title: state.title,
          subtitle: state.subtitle,
          content,
        }),
      })
      .where(and(eq(PageContentStates.pageId, commit.pageId)));

    await enqueueJob(tx, 'page:search:index-update', commit.pageId);

    pubsub.publish('page:content:commit', commit.pageId, {
      pageId: commit.pageId,
      version: state.version + 1,
      ref: commit.ref,
      steps: tr.steps.map((s) => s.toJSON()),
    });

    return commit;
  });

  const page = await db
    .select({ siteId: Pages.siteId })
    .from(Pages)
    .where(eq(Pages.id, commit.pageId))
    .then(firstOrThrow);

  pubsub.publish('site:update', page.siteId, { scope: 'page', pageId: commit.pageId });
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
      contentId: PageContents.id,
      content: PageContents.content,
      title: PageContents.title,
      subtitle: PageContents.subtitle,
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

  const PREFER_CHUNK_SIZE = 1;

  const chunks: { str: string; hash: string }[] = [];
  let currentChunkSize = 0;
  let chunkIndex = 0;

  if (page.title) {
    chunks.push({ str: page.title, hash: Bun.hash(page.title).toString() });
  }

  if (page.subtitle) {
    chunks.push({ str: page.subtitle, hash: Bun.hash(page.subtitle).toString() });
  }

  // 이건 Array의 forEach가 아니라구 ESLint 너가 몰알아???
  // eslint-disable-next-line unicorn/no-array-for-each
  content.forEach((node, _, i) => {
    currentChunkSize += node.textContent.length;
    if (currentChunkSize >= PREFER_CHUNK_SIZE || i === content.childCount - 1) {
      const chunk = node.textBetween(chunkIndex, i + 1, '\n');
      chunks.push({ str: chunk, hash: Bun.hash(chunk).toString() });
      currentChunkSize = 0;
      chunkIndex = i + 1;
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
