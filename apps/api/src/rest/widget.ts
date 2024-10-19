import { and, cosineDistance, desc, eq, gt, inArray, sql } from 'drizzle-orm';
import Elysia, { t } from 'elysia';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';
import { db, PageContentChunks, PageContents, Pages } from '@/db';
import { PageState } from '@/enums';
import * as openai from '@/external/openai';
import { keywordSearchPrompt } from '@/prompt/widget';

export const widget = new Elysia({ prefix: '/widget' });

widget.post(
  '/query',
  async ({ body }) => {
    const keywords = body.keywords;

    const queryVector = await openai.client.embeddings
      .create({
        model: 'text-embedding-3-small',
        input: keywords.join(' '),
      })
      .then((response) => response.data[0].embedding);

    const similarity = sql<number>`1 - (${cosineDistance(PageContentChunks.vector, queryVector)})`;

    const pages = await db
      .select({
        pageId: PageContentChunks.pageId,
        similarity,
        title: PageContents.title,
        subtitle: PageContents.subtitle,
        text: PageContents.text,
      })
      .from(PageContentChunks)
      .innerJoin(Pages, eq(Pages.id, PageContentChunks.pageId))
      .innerJoin(PageContents, eq(PageContents.pageId, PageContentChunks.pageId))
      .where(and(eq(Pages.siteId, body.siteId), eq(Pages.state, PageState.PUBLISHED), gt(similarity, 0.2)))
      .orderBy(desc(similarity))
      .limit(20);

    if (pages.length === 0) {
      return [];
    }

    const result = await openai.client.beta.chat.completions
      .parse({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: keywordSearchPrompt,
          },
          {
            role: 'user',
            content: JSON.stringify({
              keywords,
              pages,
            }),
          },
        ],

        response_format: zodResponseFormat(
          z.object({
            pages: z.array(
              z.object({
                id: z.string(),
                score: z.number(),
              }),
            ),
          }),
          'search-pages-by-keywords-result',
        ),
      })
      .then((response) => response.choices[0].message.parsed);

    if (!result) {
      return [];
    }

    const resultPages = await db
      .select({
        id: PageContents.pageId,
        title: PageContents.title,
      })
      .from(PageContents)
      .where(
        inArray(
          PageContents.pageId,
          result.pages.map((reference) => reference.id),
        ),
      );

    const sortedResultPages = resultPages.toSorted(
      (a, b) =>
        result.pages.findIndex((reference) => reference.id === a.id) -
        result.pages.findIndex((reference) => reference.id === b.id),
    );

    return {
      pages: sortedResultPages.map((page) => ({
        ...page,
        score: result.pages.find((reference) => reference.id === page.id)?.score,
      })),
    };
  },
  {
    body: t.Object({
      siteId: t.String(),
      keywords: t.Array(t.String()),
    }),
  },
);
