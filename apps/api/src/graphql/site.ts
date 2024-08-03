import { faker } from '@faker-js/faker';
import { and, asc, eq, isNull, ne } from 'drizzle-orm';
import { match } from 'ts-pattern';
import { builder } from '@/builder';
import { db, extractTableCode, first, firstOrThrow, Pages, Sites } from '@/db';
import { PageState, SiteState, TeamMemberRole } from '@/enums';
import { env } from '@/env';
import { ApiError } from '@/errors';
import { pubsub } from '@/pubsub';
import { dataSchemas } from '@/schemas';
import { assertSitePermission, assertTeamPermission } from '@/utils/permissions';
import { ISite, Page, PublicSite, Site } from './objects';

/**
 * * Types
 */

ISite.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    logoUrl: t.exposeString('logoUrl', { nullable: true }),

    url: t.string({ resolve: (site) => `https://${site.slug}.${env.USERSITE_DEFAULT_HOST}` }),
  }),
});

Site.implement({
  interfaces: [ISite],
  fields: (t) => ({
    pages: t.field({
      type: [Page],
      resolve: async (site) => {
        return await db
          .select()
          .from(Pages)
          .where(and(eq(Pages.siteId, site.id), isNull(Pages.parentId), ne(Pages.state, PageState.DELETED)))
          .orderBy(asc(Pages.order));
      },
    }),
  }),
});

PublicSite.implement({
  interfaces: [ISite],
  fields: (t) => ({
    pages: t.field({
      type: [Page],
      resolve: async (site) => {
        return await db
          .select()
          .from(Pages)
          .where(and(eq(Pages.siteId, site.id), isNull(Pages.parentId), eq(Pages.state, PageState.PUBLISHED)))
          .orderBy(asc(Pages.order));
      },
    }),
  }),
});

/**
 * * Queries
 */

builder.queryFields((t) => ({
  site: t.withAuth({ session: true }).field({
    type: Site,
    args: { siteId: t.arg.id() },
    resolve: async (_, args, ctx) => {
      await assertSitePermission({
        siteId: args.siteId,
        userId: ctx.session.userId,
      });

      return args.siteId;
    },
  }),

  publicSite: t.field({
    type: PublicSite,
    args: { hostname: t.arg.string() },
    resolve: async (_, args) => {
      const slug = args.hostname.split('.')[0];

      return await db
        .select()
        .from(Sites)
        .where(and(eq(Sites.slug, slug), eq(Sites.state, SiteState.ACTIVE)))
        .then(firstOrThrow);
    },
  }),
}));

/**
 * * Mutations
 */

builder.mutationFields((t) => ({
  createSite: t.withAuth({ session: true }).fieldWithInput({
    type: Site,
    input: {
      teamId: t.input.id(),
      name: t.input.string({ validate: { schema: dataSchemas.site.name } }),
    },
    resolve: async (_, { input }, ctx) => {
      await assertTeamPermission({
        teamId: input.teamId,
        userId: ctx.session.userId,
        role: TeamMemberRole.ADMIN,
      });

      const slug = [
        faker.word.adjective({ length: { min: 3, max: 5 } }),
        faker.word.noun({ length: { min: 4, max: 6 } }),
        faker.string.numeric({ length: { min: 3, max: 4 } }),
      ].join('-');

      const site = await db
        .insert(Sites)
        .values({
          teamId: input.teamId,
          name: input.name,
          slug,
        })
        .returning()
        .then(firstOrThrow);

      return site;
    },
  }),

  updateSite: t.withAuth({ session: true }).fieldWithInput({
    type: Site,
    input: {
      siteId: t.input.id(),
      name: t.input.string({ validate: { schema: dataSchemas.site.name } }),
      slug: t.input.string({ validate: { schema: dataSchemas.site.slug } }),
      logoUrl: t.input.string({ validate: { schema: dataSchemas.blob.url } }),
    },
    resolve: async (_, { input }, ctx) => {
      await assertSitePermission({
        siteId: input.siteId,
        userId: ctx.session.userId,
        role: TeamMemberRole.ADMIN,
      });

      const existingSite = await db
        .select({ id: Sites.id })
        .from(Sites)
        .where(and(eq(Sites.slug, input.slug), eq(Sites.state, SiteState.ACTIVE)))
        .then(first);

      if (existingSite) {
        throw new ApiError({ code: 'site_slug_exists' });
      }

      return await db
        .update(Sites)
        .set({ name: input.name, slug: input.slug, logoUrl: input.logoUrl })
        .where(eq(Sites.id, input.siteId))
        .returning()
        .then(firstOrThrow);
    },
  }),

  deleteSite: t.withAuth({ session: true }).fieldWithInput({
    type: Site,
    input: { siteId: t.input.id() },
    resolve: async (_, { input }, ctx) => {
      await assertSitePermission({
        siteId: input.siteId,
        userId: ctx.session.userId,
        role: TeamMemberRole.ADMIN,
      });

      return await db
        .update(Sites)
        .set({ state: SiteState.DELETED })
        .where(eq(Sites.id, input.siteId))
        .returning()
        .then(firstOrThrow);
    },
  }),
}));

/**
 * * Subscriptions
 */

builder.subscriptionFields((t) => ({
  siteUpdateStream: t.withAuth({ session: true }).field({
    type: t.builder.unionType('SiteUpdateStreamPayload', {
      types: [Site, Page],
      resolveType(parent) {
        const code = extractTableCode(parent.id);
        return match(code)
          .with('S', () => 'Site')
          .with('P', () => 'Page')
          .run();
      },
    }),
    args: { siteId: t.arg.id() },
    subscribe: async (_, args, ctx) => {
      await assertSitePermission({
        siteId: args.siteId,
        userId: ctx.session.userId,
      });

      const repeater = pubsub.subscribe('site:update', args.siteId);

      ctx.req.signal.addEventListener('abort', () => {
        repeater.return();
      });

      return repeater;
    },
    resolve: async (payload, args) => {
      // eslint-disable-next-line unicorn/prefer-ternary
      if (payload.scope === 'site') {
        return await db.select().from(Sites).where(eq(Sites.id, args.siteId)).then(firstOrThrow);
      } else {
        return await db.select().from(Pages).where(eq(Pages.id, payload.pageId)).then(firstOrThrow);
      }
    },
  }),
}));
