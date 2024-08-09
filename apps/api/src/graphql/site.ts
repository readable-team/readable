import { resolveCname } from 'node:dns/promises';
import { faker } from '@faker-js/faker';
import { and, asc, eq, isNull, ne } from 'drizzle-orm';
import { match } from 'ts-pattern';
import { builder } from '@/builder';
import { db, extractTableCode, first, firstOrThrow, Pages, SiteCustomDomains, Sites } from '@/db';
import { PageState, SiteCustomDomainState, SiteState, TeamMemberRole } from '@/enums';
import { env } from '@/env';
import { ApiError } from '@/errors';
import { enqueueJob } from '@/jobs';
import { pubsub } from '@/pubsub';
import { dataSchemas } from '@/schemas';
import { assertSitePermission, assertTeamPermission } from '@/utils/permissions';
import { Image, ISite, Page, PublicPage, PublicSite, Site, Team } from './objects';

/**
 * * Types
 */

ISite.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    slug: t.exposeString('slug'),

    logo: t.field({ type: Image, nullable: true, resolve: (site) => site.logoId }),

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

    team: t.field({ type: Team, resolve: (site) => site.teamId }),
  }),
});

PublicSite.implement({
  interfaces: [ISite],
  fields: (t) => ({
    pages: t.field({
      type: [PublicPage],
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
      if (args.hostname.endsWith(env.USERSITE_DEFAULT_HOST)) {
        const slug = args.hostname.split('.')[0];

        return await db
          .select()
          .from(Sites)
          .where(and(eq(Sites.slug, slug), eq(Sites.state, SiteState.ACTIVE)))
          .then(firstOrThrow);
      } else {
        const result = await db
          .select({ Sites, SiteCustomDomains })
          .from(SiteCustomDomains)
          .innerJoin(Sites, eq(Sites.id, SiteCustomDomains.siteId))
          .where(eq(SiteCustomDomains.domain, args.hostname))
          .then(firstOrThrow);

        if (result.SiteCustomDomains.state === SiteCustomDomainState.ACTIVE) {
          return result.Sites;
        }

        if (!result?.SiteCustomDomains) {
          throw new ApiError({ code: 'not_found' });
        }

        const cnameResult = await resolveCname(args.hostname).then((arr) => arr[0]);

        if (!cnameResult?.endsWith(env.USERSITE_DEFAULT_HOST)) {
          throw new ApiError({ code: 'not_found' });
        }

        const slug = cnameResult.split('.')[0];

        if (slug !== result.Sites.slug) {
          throw new ApiError({ code: 'not_found' });
        }

        await db
          .update(SiteCustomDomains)
          .set({ state: SiteCustomDomainState.ACTIVE })
          .where(eq(SiteCustomDomains.id, result.SiteCustomDomains.id));

        return result.Sites;
      }
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
      logoId: t.input.id({ required: false }),
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
        .where(and(eq(Sites.slug, input.slug), eq(Sites.state, SiteState.ACTIVE), ne(Sites.id, input.siteId)))
        .then(first);

      if (existingSite) {
        throw new ApiError({ code: 'site_slug_exists' });
      }

      return await db
        .update(Sites)
        .set({ name: input.name, slug: input.slug, logoId: input.logoId })
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

      const [site, deletedPageIds] = await db.transaction(async (tx) => {
        const deletedPageIds = await tx
          .update(Pages)
          .set({ state: PageState.DELETED })
          .where(eq(Pages.siteId, input.siteId))
          .returning({ id: Pages.id })
          .then((rows) => rows.map((row) => row.id));

        const site = await tx
          .update(Sites)
          .set({ state: SiteState.DELETED })
          .where(eq(Sites.id, input.siteId))
          .returning()
          .then(firstOrThrow);

        return [site, deletedPageIds];
      });

      await Promise.all(deletedPageIds.map((pageId) => enqueueJob('page:search:index-update', pageId)));

      return site;
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
