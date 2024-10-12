import { and, cosineDistance, desc, eq, gt, inArray, sql } from 'drizzle-orm';
import Elysia, { t } from 'elysia';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';
import { db, PageContentChunks, PageContents, Pages } from '@/db';
import { PageState } from '@/enums';
import * as openai from '@/external/openai';
import { keywordInferencePrompt, naturalLanguageSearchPrompt } from '@/prompt/widget';

export const widget = new Elysia({ prefix: '/widget' });

widget.post(
  '/query',
  async ({ body }) => {
    const input = body.keywords.join(' ');

    const keyword = await openai.client.beta.chat.completions
      .parse({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: keywordInferencePrompt,
          },
          {
            role: 'user',
            content: input,
          },
        ],

        response_format: zodResponseFormat(
          z.object({
            keyword: z.string(),
          }),
          'keyword-inference',
        ),
      })
      .then((response) => response.choices[0].message.parsed?.keyword);

    if (!keyword) {
      return [];
    }

    const queryVector = await openai.client.embeddings
      .create({
        model: 'text-embedding-3-small',
        input: keyword,
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
      .where(and(eq(Pages.siteId, body.siteId), eq(Pages.state, PageState.PUBLISHED), gt(similarity, 0.35)))
      .orderBy(desc(similarity))
      .limit(10);

    if (pages.length === 0) {
      return [];
    }

    const result = await openai.client.beta.chat.completions
      .parse({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: naturalLanguageSearchPrompt,
          },
          {
            role: 'user',
            content: JSON.stringify({
              keyword,
              pages,
            }),
          },
        ],

        response_format: zodResponseFormat(
          z.object({
            references: z.array(z.string()),
          }),
          'search-pages-by-natural-language-result',
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
      .where(inArray(PageContents.pageId, result.references));

    return resultPages.toSorted((a, b) => result.references.indexOf(a.id) - result.references.indexOf(b.id));
  },
  {
    body: t.Object({
      siteId: t.String(),
      keywords: t.Array(t.String()),
    }),
  },
);
