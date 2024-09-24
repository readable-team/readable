import { and, eq, getTableColumns, isNull } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { match } from 'ts-pattern';
import { builder } from '@/builder';
import { Categories, db, Embeds, first, firstOrThrow, Pages, SiteCustomDomains, Sites } from '@/db';
import { CategoryState, PageState, SiteCustomDomainState } from '@/enums';
import { env } from '@/env';
import * as iframely from '@/external/iframely';
import { Embed, Page } from './objects';

/**
 * * Types
 */

Embed.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    url: t.exposeString('url'),
    title: t.exposeString('title', { nullable: true }),
    description: t.exposeString('description', { nullable: true }),
    thumbnailUrl: t.exposeString('thumbnailUrl', { nullable: true }),
    html: t.exposeString('html', { nullable: true }),
  }),
});

/**
 * * Mutations
 */

builder.mutationFields((t) => ({
  unfurlLink: t.withAuth({ session: true }).fieldWithInput({
    type: builder.unionType('UnfurlLinkResult', {
      types: [
        Page,
        builder.simpleObject('UnfurlLinkUrl', {
          fields: (t) => ({
            url: t.string(),
          }),
        }),
      ],
      resolveType: (value) => ('id' in value ? 'Page' : 'UnfurlLinkUrl'),
    }),
    input: { siteId: t.input.id(), url: t.input.string({ validate: { url: true } }) },
    resolve: async (_, { input }) => {
      const site = await db
        .select({ id: Sites.id, teamId: Sites.teamId, slug: Sites.slug })
        .from(Sites)
        .where(eq(Sites.id, input.siteId))
        .then(firstOrThrow);

      const customDomain = await db
        .select({ domain: SiteCustomDomains.domain })
        .from(SiteCustomDomains)
        .where(and(eq(SiteCustomDomains.siteId, site.id), eq(SiteCustomDomains.state, SiteCustomDomainState.ACTIVE)))
        .then(first);

      const url = new URL(input.url);

      if (url.protocol === 'page:') {
        const pageId = url.pathname.slice(1);

        const page = await db
          .select()
          .from(Pages)
          .where(and(eq(Pages.siteId, site.id), eq(Pages.id, pageId)))
          .then(firstOrThrow);

        return page;
      }

      if (url.origin === env.PUBLIC_DASHBOARD_URL && url.pathname.startsWith(`/${site.teamId}/${site.id}/`)) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const pageId = url.pathname.slice(1).split('/').pop()!;

        const page = await db
          .select()
          .from(Pages)
          .where(and(eq(Pages.siteId, site.id), eq(Pages.id, pageId)))
          .then(firstOrThrow);

        return page;
      }

      const siteUrls = [];
      siteUrls.push(`https://${site.slug}.${env.USERSITE_DEFAULT_HOST}`);
      if (customDomain) {
        siteUrls.push(`https://${customDomain.domain}`);
      }

      if (siteUrls.includes(url.origin)) {
        const slugs = url.pathname.slice(1).split('/');
        const [categorySlug, parentSlug, pageSlug] = match(slugs.length)
          .with(2, () => [slugs[0], null, slugs[1]] as const)
          .with(3, () => [slugs[0], slugs[1], slugs[2]] as const)
          .run();

        const Pages2 = alias(Pages, 'p');

        const page = await db
          .select(getTableColumns(Pages))
          .from(Pages)
          .innerJoin(Categories, eq(Categories.id, Pages.categoryId))
          .leftJoin(Pages2, eq(Pages2.id, Pages.parentId))
          .where(
            and(
              eq(Pages.siteId, input.siteId),
              eq(Categories.slug, categorySlug),
              parentSlug ? eq(Pages2.slug, parentSlug) : isNull(Pages.parentId),
              eq(Pages.slug, pageSlug),
              eq(Categories.state, CategoryState.ACTIVE),
              eq(Pages.state, PageState.PUBLISHED),
            ),
          )
          .then(firstOrThrow);

        return page;
      }

      return {
        url: input.url,
      };
    },
  }),

  unfurlEmbed: t.withAuth({ session: true }).fieldWithInput({
    type: Embed,
    input: {
      url: t.input.string({ validate: { url: true } }),
      noCache: t.input.boolean(),
    },
    resolve: async (_, { input }) => {
      const embed = await db.select().from(Embeds).where(eq(Embeds.url, input.url)).then(first);
      if (embed) {
        if (input.noCache) {
          await db.delete(Embeds).where(eq(Embeds.id, embed.id));
        } else {
          return embed;
        }
      }

      const meta = await iframely.unfurl(input.url);

      return await db
        .insert(Embeds)
        .values({
          type: meta.type,
          url: input.url,
          title: meta.title,
          description: meta.description,
          thumbnailUrl: meta.thumbnailUrl,
          html: meta.html,
        })
        .returning()
        .then(firstOrThrow);
    },
  }),
}));
