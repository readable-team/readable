import { and, eq, inArray, isNotNull } from 'drizzle-orm';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';
import { builder } from '@/builder';
import { db, PageContents, Pages } from '@/db';
import { PageState } from '@/enums';
import * as openai from '@/external/openai';
import { searchIndex } from '@/search';
import { assertSitePermission } from '@/utils/permissions';
import { Page, PublicPage } from './objects';

type PageSearchData = {
  id: string;
  title?: string;
  subtitle?: string;
  text: string;
};

const PageSearchHighlight = builder.objectRef<Partial<PageSearchData>>('PageSearchHighlight');
PageSearchHighlight.implement({
  fields: (t) => ({
    title: t.exposeString('title', { nullable: true }),
    subtitle: t.exposeString('subtitle', { nullable: true }),
    text: t.exposeString('text', { nullable: true }),
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

type SearchByPageChangesHitFix = {
  kind: string;
  text: string;
  reason: string;
  completion: string;
};

type SearchByPageChangesHit = {
  pageId: string;
  fixes: SearchByPageChangesHitFix[];
};

const SearchByPageChangesHitFix = builder.objectRef<SearchByPageChangesHitFix>('SearchByPageChangesHitFix');
SearchByPageChangesHitFix.implement({
  fields: (t) => ({
    kind: t.exposeString('kind'),
    text: t.exposeString('text'),
    reason: t.exposeString('reason'),
    completion: t.exposeString('completion'),
  }),
});

const SearchByPageChangesHit = builder.objectRef<SearchByPageChangesHit>('SearchByPageChangesHit');
SearchByPageChangesHit.implement({
  fields: (t) => ({
    page: t.field({ type: Page, resolve: (page) => page.pageId }),
    fixes: t.field({ type: [SearchByPageChangesHitFix], resolve: (page) => page.fixes }),
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

  searchPageByChanges: t.withAuth({ session: true }).field({
    type: [SearchByPageChangesHit],
    args: {
      siteId: t.arg.string(),
      query: t.arg.string(),
    },
    resolve: async (_, args, ctx) => {
      await assertSitePermission({
        siteId: args.siteId,
        userId: ctx.session.userId,
      });

      const documents = await db
        .select({ id: Pages.id, summary: PageContents.summary })
        .from(Pages)
        .innerJoin(PageContents, and(eq(Pages.id, PageContents.pageId), isNotNull(PageContents.summary)))
        .where(and(eq(Pages.siteId, args.siteId), eq(Pages.state, PageState.PUBLISHED)));

      const relatedPageIds = await openai.client.beta.chat.completions
        .parse({
          model: 'gpt-4o-mini',
          temperature: 0.5,
          max_tokens: 256,
          response_format: zodResponseFormat(z.object({ result: z.array(z.string()) }), 'result'),
          messages: [
            {
              role: 'system',
              content: `You are an assistant that receives changes to a service and finds documents that might be affected by them based on their summaries. A document's summary consists of an array of ids and summaries. You need to create a JSON array of the ids of documents whose content might be changed by the change and output them in the form {"result": [<array>]}. If a change is not likely to change the content of a document, even if it is relevant to the document, it should be left out of the result. If the change is likely to change the content of the document, even if it's not directly mentioned in the summary, it should appear in the results. If there are no relevant documents, you should output an empty array. If there are multiple documents that might be relevant, you should output multiple IDs as an array. The order of the array should be more relevant first.`,
            },
            { role: 'user', content: JSON.stringify({ documents, change: args.query }) },
          ],
        })
        .then((response) => response.choices[0].message.parsed?.result ?? []);

      if (relatedPageIds.length === 0) {
        return [];
      }

      const pages = await db
        .select({ id: Pages.id, title: PageContents.title, subtitle: PageContents.subtitle, text: PageContents.text })
        .from(Pages)
        .innerJoin(PageContents, eq(Pages.id, PageContents.pageId))
        .where(
          and(eq(Pages.siteId, args.siteId), eq(Pages.state, PageState.PUBLISHED), inArray(Pages.id, relatedPageIds)),
        );

      return await Promise.all(
        pages.map(async (page) => {
          const result = await openai.client.beta.chat.completions
            .parse({
              model: 'gpt-4o-2024-08-06',
              temperature: 0.5,
              max_tokens: 1024,
              response_format: zodResponseFormat(
                z.object({
                  fixes: z.array(
                    z.object({ kind: z.string(), text: z.string(), reason: z.string(), completion: z.string() }),
                  ),
                }),
                'fixes',
              ),
              messages: [
                {
                  role: 'system',
                  content: `You are an assistant that receives changes from the service and fixes inconsistencies in the documentation. You need to create a JSON array of objective inconsistencies in the documentation due to changes in the service and output it in the form {"fixes":[{"kind":"","text":"","reason":"","completion":""}]}. "kind" is the classification of the fix ("WARNING" if it's likely to be an error but not 100%, "ERROR" if it's 100% error), "text" is the text of the inconsistency in the document, "reason" is the reason for the inconsistency, and "completion" is an example of the fix. Subjective discrepancies must not be corrected. Only objective inconsistencies, such as technical errors or misinformation, could be corrected. Something isn't mentioned in the documentation is not a reason to edit. Sometimes the correction is irrelevant to the documentation, so if there are no inconsistencies, you should output an empty array instead of creating an inconsistency hallucination. "reason" always respond in 한국어.`,
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
            pageId: page.id,
            fixes: result,
          };
        }),
      ).then((result) => result.filter((page) => page.fixes.length > 0));
    },
  }),

  searchPublicPage: t.withAuth({ session: true }).field({
    type: SearchPublicPageResult,
    args: {
      siteId: t.arg.string(),
      query: t.arg.string(),
    },
    resolve: async (_, args) => {
      const result = await searchIndex('pages').search<PageSearchData>(args.query, {
        attributesToCrop: ['*'],
        attributesToHighlight: ['*'],
        filter: [`siteId = ${args.siteId}`, `state = ${PageState.PUBLISHED}`],
      });

      return result;
    },
  }),
}));
