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
  severity: 'WARNING' | 'ERROR';
  text: string;
  reason: string;
  completion: string;
};

type SearchByPageChangesHit = {
  pageId: string;
  fixes: SearchByPageChangesHitFix[];
};

const SearchByPageChangesHitFixSeverity = builder.enumType('SearchByPageChangesHitFixSeverity', {
  values: ['WARNING', 'ERROR'] as const,
});

const SearchByPageChangesHitFix = builder.objectRef<SearchByPageChangesHitFix>('SearchByPageChangesHitFix');
SearchByPageChangesHitFix.implement({
  fields: (t) => ({
    text: t.exposeString('text'),
    reason: t.exposeString('reason'),
    completion: t.exposeString('completion'),
    severity: t.expose('severity', { type: SearchByPageChangesHitFixSeverity }),
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
                    z.object({
                      severity: z.enum(['WARNING', 'ERROR']),
                      text: z.string(),
                      reason: z.string(),
                      completion: z.string(),
                    }),
                  ),
                }),
                'fixes',
              ),
              messages: [
                {
                  role: 'system',
                  content: `너는 서비스의 변경점을 받아서 문서와의 불일치하는 부분을 찾는 AI야. 서비스의 변경된 점이 문서와 객관적으로 불일치하는 부분을 찾아서 {"fixes":[{"severity":"","text":"","reason":"","completion":""}]} JSON Array 형식으로 출력해야 해. "severity" 는 수정의 심각성이야. 불일치가 있을 가능성이 있지만 100%는 아니라면 "WARNING", 어느 관점에서 바라보더라도 객관적으로 불일치가 맞다면 "ERROR" 값을 가져. "text" 는 서비스 변경점과 불일치하는 문서의 원문 내용, "reason" 은 문서가 불일치하는 이유(반드시 한국어로 써야 해), "completion" 는 불일치를 해결할 수 있는 문서의 수정 예시야. 주관적인 불일치는 수정하면 안 돼고 오직 기술적 문제나 잘못된 정보 등의 객관적인 불일치만 수정해야 해. 서비스의 변경점과 문서가 관련이 없는 경우는 절대 불일치가 아니야. 어떤 불일치도 없다면 "fixes"는 빈 배열이 되어야 해.`,
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
