import { faker } from '@faker-js/faker';
import { and, asc, eq, getTableColumns, isNull, ne } from 'drizzle-orm';
import { generateJitteredKeyBetween } from 'fractional-indexing-jittered';
import { Repeater } from 'graphql-yoga';
import { match } from 'ts-pattern';
import { builder } from '@/builder';
import { db, extractTableCode, first, firstOrThrow, Pages, Sections, SiteCustomDomains, Sites } from '@/db';
import { PageState, SiteCustomDomainState, SiteState, TeamMemberRole } from '@/enums';
import { env } from '@/env';
import { ApiError } from '@/errors';
import * as dns from '@/external/dns';
import { enqueueJob } from '@/jobs';
import { pubsub } from '@/pubsub';
import { dataSchemas } from '@/schemas';
import { assertSitePermission, assertTeamPermission } from '@/utils/permissions';
import { Image, ISite, Page, PublicPage, PublicSite, Section, Site, SiteCustomDomain, Team } from './objects';

/**
 * * Types
 */

ISite.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    slug: t.exposeString('slug'),
    themeColor: t.exposeString('themeColor'),

    logo: t.field({ type: Image, nullable: true, resolve: (site) => site.logoId }),

    url: t.string({
      resolve: async (site) => {
        const customDomain = await db
          .select({ domain: SiteCustomDomains.domain })
          .from(SiteCustomDomains)
          .where(and(eq(SiteCustomDomains.siteId, site.id), eq(SiteCustomDomains.state, SiteCustomDomainState.ACTIVE)))
          .then(first);

        return customDomain ? `https://${customDomain.domain}` : `https://${site.slug}.${env.USERSITE_DEFAULT_HOST}`;
      },
    }),
  }),
});

Site.implement({
  interfaces: [ISite],
  fields: (t) => ({
    pages: t.field({
      deprecationReason: 'use `Site.sections` instead',
      type: [Page],
      resolve: async (site) => {
        return await db
          .select()
          .from(Pages)
          .where(and(eq(Pages.siteId, site.id), isNull(Pages.parentId), ne(Pages.state, PageState.DELETED)))
          .orderBy(asc(Pages.order));
      },
    }),

    sections: t.field({
      type: [Section],
      resolve: async (site) => {
        return await db.select().from(Sections).where(eq(Sections.siteId, site.id)).orderBy(asc(Sections.order));
      },
    }),

    team: t.field({ type: Team, resolve: (site) => site.teamId }),

    customDomain: t.field({
      type: SiteCustomDomain,
      nullable: true,
      args: { state: t.arg({ type: SiteCustomDomainState }) },
      resolve: async (site, args) => {
        return await db
          .select()
          .from(SiteCustomDomains)
          .where(and(eq(SiteCustomDomains.siteId, site.id), eq(SiteCustomDomains.state, args.state)))
          .then(first);
      },
    }),
  }),
});

PublicSite.implement({
  interfaces: [ISite],
  fields: (t) => ({
    pages: t.field({
      deprecationReason: 'use `PublicSite.sections` instead',
      type: [PublicPage],
      resolve: async (site) => {
        return await db
          .select()
          .from(Pages)
          .where(and(eq(Pages.siteId, site.id), isNull(Pages.parentId), eq(Pages.state, PageState.PUBLISHED)))
          .orderBy(asc(Pages.order));
      },
    }),

    sections: t.field({
      type: [Section],
      resolve: async (site) => {
        return await db
          .select(getTableColumns(Sections))
          .from(Sections)
          .innerJoin(Pages, and(eq(Sections.id, Pages.sectionId), eq(Pages.state, PageState.PUBLISHED)))
          .where(eq(Sections.siteId, site.id))
          .groupBy(Sections.id)
          .orderBy(asc(Sections.order));
      },
    }),
  }),
});

SiteCustomDomain.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    domain: t.exposeString('domain'),
    state: t.expose('state', { type: SiteCustomDomainState }),
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
      if (args.hostname.endsWith(`.${env.USERSITE_DEFAULT_HOST}`)) {
        const slug = args.hostname.split('.')[0];

        return await db
          .select()
          .from(Sites)
          .where(and(eq(Sites.slug, slug), eq(Sites.state, SiteState.ACTIVE)))
          .then(firstOrThrow);
      } else {
        return await db
          .select(getTableColumns(Sites))
          .from(Sites)
          .innerJoin(SiteCustomDomains, eq(Sites.id, SiteCustomDomains.siteId))
          .where(
            and(
              eq(SiteCustomDomains.domain, args.hostname),
              eq(SiteCustomDomains.state, SiteCustomDomainState.ACTIVE),
              eq(Sites.state, SiteState.ACTIVE),
            ),
          )
          .then(firstOrThrow);
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
          themeColor: '#41c6b5',
        })
        .returning()
        .then(firstOrThrow);

      await db.insert(Sections).values({
        siteId: site.id,
        name: '섹션',
        order: new TextEncoder().encode(generateJitteredKeyBetween(null, null)),
      });

      return site;
    },
  }),

  updateSite: t.withAuth({ session: true }).fieldWithInput({
    type: Site,
    input: {
      siteId: t.input.id(),
      name: t.input.string({ validate: { schema: dataSchemas.site.name } }),
      slug: t.input.string({ validate: { schema: dataSchemas.site.slug } }),
      themeColor: t.input.string({ validate: { schema: dataSchemas.site.themeColor } }),
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
        .set({ name: input.name, slug: input.slug, logoId: input.logoId, themeColor: input.themeColor })
        .where(eq(Sites.id, input.siteId))
        .returning()
        .then(firstOrThrow);
    },
  }),

  setSiteCustomDomain: t.withAuth({ session: true }).fieldWithInput({
    type: SiteCustomDomain,
    input: { siteId: t.input.id(), domain: t.input.string({ validate: { schema: dataSchemas.site.domain } }) },
    resolve: async (_, { input }, ctx) => {
      await assertSitePermission({
        siteId: input.siteId,
        userId: ctx.session.userId,
        role: TeamMemberRole.ADMIN,
      });

      const existingDomain = await db
        .select({ id: SiteCustomDomains.id })
        .from(SiteCustomDomains)
        .where(and(eq(SiteCustomDomains.domain, input.domain), ne(SiteCustomDomains.siteId, input.siteId)))
        .then(first);

      if (existingDomain) {
        throw new ApiError({ code: 'site_custom_domain_duplicate' });
      }

      return await db.transaction(async (tx) => {
        await tx
          .delete(SiteCustomDomains)
          .where(
            and(eq(SiteCustomDomains.siteId, input.siteId), eq(SiteCustomDomains.state, SiteCustomDomainState.PENDING)),
          );

        return await tx
          .insert(SiteCustomDomains)
          .values({
            siteId: input.siteId,
            domain: input.domain,
            state: SiteCustomDomainState.PENDING,
          })
          .returning()
          .then(firstOrThrow);
      });
    },
  }),

  unsetSiteCustomDomain: t.withAuth({ session: true }).fieldWithInput({
    type: SiteCustomDomain,
    input: { siteCustomDomainId: t.input.id() },
    resolve: async (_, { input }, ctx) => {
      const customDomain = await db
        .select({ siteId: SiteCustomDomains.siteId })
        .from(SiteCustomDomains)
        .where(eq(SiteCustomDomains.id, input.siteCustomDomainId))
        .then(firstOrThrow);

      await assertSitePermission({
        siteId: customDomain.siteId,
        userId: ctx.session.userId,
        role: TeamMemberRole.ADMIN,
      });

      return await db
        .delete(SiteCustomDomains)
        .where(eq(SiteCustomDomains.id, input.siteCustomDomainId))
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

  siteCustomDomainValidationStream: t.withAuth({ session: true }).field({
    type: SiteCustomDomain,
    args: { siteCustomDomainId: t.arg.id() },
    subscribe: async (_, args, ctx) => {
      const customDomain = await db
        .select({ siteId: SiteCustomDomains.siteId })
        .from(SiteCustomDomains)
        .where(eq(SiteCustomDomains.id, args.siteCustomDomainId))
        .then(firstOrThrow);

      await assertSitePermission({
        siteId: customDomain.siteId,
        userId: ctx.session.userId,
        role: TeamMemberRole.ADMIN,
      });

      const repeater = new Repeater<string>(async (push, stop) => {
        push(args.siteCustomDomainId);

        const timer = setInterval(async () => {
          try {
            const domain = await db
              .select({ id: SiteCustomDomains.id, domain: SiteCustomDomains.domain, state: SiteCustomDomains.state })
              .from(SiteCustomDomains)
              .where(eq(SiteCustomDomains.id, args.siteCustomDomainId))
              .then(firstOrThrow);

            if (domain.state === SiteCustomDomainState.PENDING) {
              const records = await dns.lookupCnames(domain.domain);

              if (records?.includes(env.USERSITE_CNAME_HOST)) {
                await db.transaction(async (tx) => {
                  await tx
                    .delete(SiteCustomDomains)
                    .where(
                      and(
                        eq(SiteCustomDomains.siteId, customDomain.siteId),
                        eq(SiteCustomDomains.state, SiteCustomDomainState.ACTIVE),
                      ),
                    );

                  await tx
                    .update(SiteCustomDomains)
                    .set({ state: SiteCustomDomainState.ACTIVE })
                    .where(eq(SiteCustomDomains.id, domain.id));
                });
              }
            }
          } catch {
            // noop
          } finally {
            push(args.siteCustomDomainId);
          }
        }, 1000);

        await stop;
        clearInterval(timer);
      });

      ctx.req.signal.addEventListener('abort', () => {
        repeater.return();
      });

      return repeater;
    },
    resolve: async (customDomainId) => customDomainId,
  }),
}));
