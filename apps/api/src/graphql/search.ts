import { and, cosineDistance, desc, eq, gt, sql } from 'drizzle-orm';
import DOMPurify from 'isomorphic-dompurify';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';
import { builder } from '@/builder';
import { db, PageContentChunks, PageContents, Pages } from '@/db';
import { PageState } from '@/enums';
import { ReadableError } from '@/errors';
import * as openai from '@/external/openai';
import { fixByChangePrompt } from '@/prompt/fix-by-change';
import { keywordExtractionPrompt, naturalLanguageSearchPrompt } from '@/prompt/natural-language-search';
import { searchIndex } from '@/search';
import { assertSitePermission } from '@/utils/permissions';
import { assertTeamPlanRule } from '@/utils/plan';
import { Page, PublicPage } from './objects';

type PageSearchData = {
  id: string;
  title?: string;
  subtitle?: string;
  text: string;
};

const sanitizeHtmlOnlyEm = (dirty: string | undefined) => {
  return dirty
    ? DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS: ['em'],
      })
    : undefined;
};

type VectorSearchParams = {
  query: string;
  siteId: string;
};

const vectorSearch = async ({ query, siteId }: VectorSearchParams) => {
  console.log('vectorSearch', query);

  const queryVector = await openai.client.embeddings
    .create({
      model: 'text-embedding-3-small',
      input: query,
    })
    .then((response) => response.data[0].embedding);

  const similarity = sql<number>`1 - (${cosineDistance(PageContentChunks.vector, queryVector)})`;

  return await db
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
    .where(and(eq(Pages.siteId, siteId), eq(Pages.state, PageState.PUBLISHED), gt(similarity, 0.35)))
    .orderBy(desc(similarity))
    .limit(10);
};

const PageSearchHighlight = builder.objectRef<Partial<PageSearchData>>('PageSearchHighlight');
PageSearchHighlight.implement({
  fields: (t) => ({
    title: t.string({ nullable: true, resolve: (highlight) => sanitizeHtmlOnlyEm(highlight.title) }),
    subtitle: t.string({ nullable: true, resolve: (highlight) => sanitizeHtmlOnlyEm(highlight.subtitle) }),
    text: t.string({ nullable: true, resolve: (highlight) => sanitizeHtmlOnlyEm(highlight.text) }),
  }),
});

type SearchResult = {
  id: string;
  _formatted?: Partial<PageSearchData>;
};

const IPageSearchHit = builder.interfaceRef<SearchResult>('IPageSearchHit');
IPageSearchHit.implement({
  fields: (t) => ({
    highlight: t.expose('_formatted', { type: PageSearchHighlight, nullable: true }),
  }),
});

const PageSearchHit = builder.objectRef<SearchResult>('PageSearchHit');
PageSearchHit.implement({
  interfaces: [IPageSearchHit],
  fields: (t) => ({
    page: t.field({ type: Page, resolve: (page) => page.id }),
  }),
});

const PublicPageSearchHit = builder.objectRef<SearchResult>('PublicPageSearchHit');
PublicPageSearchHit.implement({
  interfaces: [IPageSearchHit],
  fields: (t) => ({
    page: t.field({ type: PublicPage, resolve: (page) => page.id }),
  }),
});

type CountableSearchResult<T> = {
  estimatedTotalHits: number;
  hits: T[];
};

const SearchPageResult = builder.objectRef<CountableSearchResult<SearchResult>>('SearchPageResult');
SearchPageResult.implement({
  fields: (t) => ({
    estimatedTotalHits: t.exposeInt('estimatedTotalHits'),
    hits: t.field({ type: [PageSearchHit], resolve: (searchResult) => searchResult.hits }),
  }),
});

const SearchPublicPageResult = builder.objectRef<CountableSearchResult<SearchResult>>('SearchPublicPageResult');
SearchPublicPageResult.implement({
  fields: (t) => ({
    estimatedTotalHits: t.exposeInt('estimatedTotalHits'),
    hits: t.field({ type: [PublicPageSearchHit], resolve: (searchResult) => searchResult.hits }),
  }),
});

type SearchPageByChangeHit = {
  pageId: string;
  fixes: {
    text: string;
    relevance: number;
    reason: string;
  }[];
};

const SearchPageByChangeHit = builder.objectRef<SearchPageByChangeHit>('SearchPageByChangeHit');
SearchPageByChangeHit.implement({
  fields: (t) => ({
    page: t.field({ type: Page, resolve: (hit) => hit.pageId }),
    fixes: t.field({
      type: [
        builder.simpleObject('SearchPageByChangeFix', {
          fields: (t) => ({
            text: t.string(),
            relevance: t.float(),
            reason: t.string(),
          }),
        }),
      ],
      resolve: (hit) => hit.fixes,
    }),
  }),
});

type SearchPublicPageByNaturalLanguageResult = {
  answer: string;
  pageIds: string[];
};

const SearchPublicPageByNaturalLanguageResult = builder.objectRef<SearchPublicPageByNaturalLanguageResult>(
  'SearchPublicPageByNaturalLanguageResult',
);
SearchPublicPageByNaturalLanguageResult.implement({
  fields: (t) => ({
    answer: t.exposeString('answer'),
    pages: t.field({
      type: [PublicPage],
      resolve: (result) => result.pageIds,
    }),
  }),
});

builder.queryFields((t) => ({
  searchPage: t.withAuth({ session: true }).field({
    type: SearchPageResult,
    args: {
      siteId: t.arg.string(),
      query: t.arg.string(),
    },
    resolve: async (_, args, ctx) => {
      await assertSitePermission({
        siteId: args.siteId,
        userId: ctx.session.userId,
      });

      const result = await searchIndex('pages').search<PageSearchData>(args.query, {
        attributesToCrop: ['*'],
        attributesToHighlight: ['*'],
        filter: [`siteId = ${args.siteId}`],
      });

      return result;
    },
  }),

  searchPageByChange: t.withAuth({ session: true }).field({
    type: [SearchPageByChangeHit],
    args: {
      siteId: t.arg.string(),
      query: t.arg.string(),
    },
    resolve: async (_, args, ctx) => {
      await assertSitePermission({
        siteId: args.siteId,
        userId: ctx.session.userId,
      });

      const queryVector = await openai.client.embeddings
        .create({
          model: 'text-embedding-3-small',
          input: args.query,
        })
        .then((response) => response.data[0].embedding);

      const similarity = sql<number>`1 - (${cosineDistance(PageContentChunks.vector, queryVector)})`;

      const result = await db
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
        .where(and(eq(Pages.siteId, args.siteId), eq(Pages.state, PageState.PUBLISHED), gt(similarity, 0.35)))
        .orderBy(desc(similarity))
        .limit(10);

      return await Promise.all(
        result.map(async (page) => {
          const llmResult = await openai.client.beta.chat.completions
            .parse({
              model: 'gpt-4o-mini',
              temperature: 0.5,
              max_tokens: 4096,
              response_format: zodResponseFormat(
                z.object({
                  fixes: z.array(
                    z.object({
                      relevance: z.number(),
                      text: z.string(),
                      reason: z.string(),
                    }),
                  ),
                }),
                'fixes',
              ),
              messages: [
                {
                  role: 'system',
                  content: fixByChangePrompt,
                },
                {
                  role: 'user',
                  content: JSON.stringify({
                    title: page.title,
                    subtitle: page.subtitle,
                    text: page.text,
                    change: args.query,
                  }),
                },
              ],
            })
            .then((response) => response.choices[0].message.parsed?.fixes ?? []);

          return {
            pageId: page.pageId,
            fixes: llmResult,
          };
        }),
      ).then((pageFixes) => pageFixes.filter((page) => page.fixes.some((fix) => fix.relevance > 2.5)));
    },
  }),

  searchPublicPage: t.withAuth({ site: true }).field({
    type: SearchPublicPageResult,
    args: { query: t.arg.string() },
    resolve: async (_, args, ctx) => {
      const result = await searchIndex('pages').search<PageSearchData>(args.query, {
        attributesToCrop: ['*'],
        attributesToHighlight: ['*'],
        filter: [`siteId = ${ctx.site.id}`, `state = ${PageState.PUBLISHED}`],
      });

      return result;
    },
  }),

  searchPublicPageByNaturalLanguage: t.withAuth({ site: true }).field({
    type: SearchPublicPageByNaturalLanguageResult,
    args: { query: t.arg.string() },
    resolve: async (_, args, ctx) => {
      await assertTeamPlanRule({
        teamId: ctx.site.teamId,
        rule: 'aiSearch',
      });

      const keyword = await openai.client.beta.chat.completions
        .parse({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: keywordExtractionPrompt,
            },
            {
              role: 'user',
              content: args.query,
            },
          ],

          response_format: zodResponseFormat(
            z.object({
              keyword: z.string(),
            }),
            'keyword',
          ),
        })
        .then((response) => response.choices[0].message.parsed?.keyword);

      if (!keyword) {
        throw new ReadableError({
          code: 'NOT_FOUND',
        });
      }

      const pages = await vectorSearch({ query: keyword, siteId: ctx.site.id });

      if (pages.length === 0) {
        throw new ReadableError({
          code: 'NOT_FOUND',
        });
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
              cannotAnswer: z.boolean(),
              answer: z.string(),
              references: z.array(z.string()),
            }),
            'search-public-page-by-natural-language-result',
          ),
        })
        .then((response) => response.choices[0].message.parsed);

      if (!result || result.cannotAnswer) {
        throw new ReadableError({
          code: 'NOT_FOUND',
        });
      }

      return {
        answer: result.answer,
        pageIds: result.references,
      };
    },
  }),
}));
