import { and, eq } from 'drizzle-orm';
import { builder } from '@/builder';
import { db, Embeds, first, firstOrThrow, Pages, SiteCustomDomains, Sites } from '@/db';
import { SiteCustomDomainState } from '@/enums';
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

      const dashboardUrl = `${env.PUBLIC_DASHBOARD_URL}/${site.teamId}/${site.id}/`;
      if (input.url.startsWith(dashboardUrl)) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const pageId = input.url.split('/').pop()!;

        const page = await db
          .select()
          .from(Pages)
          .where(and(eq(Pages.siteId, site.id), eq(Pages.id, pageId)))
          .then(firstOrThrow);

        return page;
      }

      const siteUrls = ['page://slug/'];
      siteUrls.push(`https://${site.slug}.${env.USERSITE_DEFAULT_HOST}/ko/`);
      if (customDomain) {
        siteUrls.push(`https://${customDomain.domain}/ko/`);
      }

      if (siteUrls.some((url) => input.url.startsWith(url))) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const slugWithTitle = input.url.split('/').pop()!;
        const slug = slugWithTitle.split('-')[0];

        const page = await db
          .select()
          .from(Pages)
          .where(and(eq(Pages.siteId, site.id), eq(Pages.slug, slug)))
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
