import { faker } from '@faker-js/faker';
import { and, asc, count, desc, eq, getTableColumns, isNull, ne } from 'drizzle-orm';
import { Repeater } from 'graphql-yoga';
import { match } from 'ts-pattern';
import * as Y from 'yjs';
import { builder } from '@/builder';
import {
  Categories,
  db,
  extractTableCode,
  first,
  firstOrThrow,
  PageContents,
  PageContentStates,
  Pages,
  SiteCustomDomains,
  Sites,
} from '@/db';
import {
  CategoryState,
  PageState,
  SiteCustomDomainState,
  SiteState,
  TeamMemberRole,
  TeamRestrictionType,
} from '@/enums';
import { env } from '@/env';
import { ReadableError } from '@/errors';
import * as dns from '@/external/dns';
import { enqueueJob } from '@/jobs';
import { pubsub } from '@/pubsub';
import { dataSchemas } from '@/schemas';
import { makeYDoc } from '@/utils/page';
import { assertSitePermission, assertTeamPermission } from '@/utils/permissions';
import { assertTeamRestriction } from '@/utils/restrictions';
import {
  Category,
  Image,
  ISite,
  Page,
  PublicCategory,
  PublicPage,
  PublicSite,
  Site,
  SiteCustomDomain,
  Team,
} from './objects';

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
    categories: t.field({
      type: [Category],
      resolve: async (site) => {
        return await db
          .select()
          .from(Categories)
          .where(and(eq(Categories.siteId, site.id), eq(Categories.state, CategoryState.ACTIVE)))
          .orderBy(asc(Categories.order));
      },
    }),

    team: t.field({ type: Team, resolve: (site) => site.teamId }),

    customDomain: t.field({
      type: SiteCustomDomain,
      nullable: true,
      resolve: async (site) => {
        return await db.select().from(SiteCustomDomains).where(eq(SiteCustomDomains.siteId, site.id)).then(first);
      },
    }),

    pageCount: t.int({
      resolve: async (site) => {
        return await db
          .select({ count: count() })
          .from(Pages)
          .where(and(eq(Pages.siteId, site.id), ne(Pages.state, PageState.DELETED)))
          .then((rows) => rows[0].count);
      },
    }),

    pageUpdatedAt: t.field({
      type: 'DateTime',
      nullable: true,
      resolve: async (site) => {
        const page = await db
          .select({ updatedAt: PageContentStates.updatedAt })
          .from(Pages)
          .innerJoin(PageContentStates, eq(Pages.id, PageContentStates.pageId))
          .where(and(eq(Pages.siteId, site.id), ne(Pages.state, PageState.DELETED)))
          .orderBy(desc(PageContentStates.updatedAt))
          .limit(1)
          .then(first);

        return page?.updatedAt;
      },
    }),

    hasPage: t.boolean({
      resolve: async (site) => {
        return await db
          .select({ count: count() })
          .from(Pages)
          .where(and(eq(Pages.siteId, site.id), ne(Pages.state, PageState.DELETED)))
          .then((rows) => rows[0].count > 0);
      },
    }),

    firstPage: t.field({
      type: Page,
      nullable: true,
      resolve: async (site) => {
        return await db
          .select(getTableColumns(Pages))
          .from(Categories)
          .innerJoin(
            Pages,
            and(eq(Categories.id, Pages.categoryId), ne(Pages.state, PageState.DELETED), isNull(Pages.parentId)),
          )
          .where(and(eq(Categories.siteId, site.id), eq(Categories.state, CategoryState.ACTIVE)))
          .orderBy(asc(Categories.order), asc(Pages.order))
          .limit(1)
          .then(first);
      },
    }),
  }),
});

PublicSite.implement({
  interfaces: [ISite],
  fields: (t) => ({
    categories: t.field({
      type: [PublicCategory],
      resolve: async (site) => {
        return await db
          .select(getTableColumns(Categories))
          .from(Categories)
          .innerJoin(Pages, and(eq(Categories.id, Pages.categoryId), eq(Pages.state, PageState.PUBLISHED)))
          .where(and(eq(Categories.siteId, site.id), eq(Categories.state, CategoryState.ACTIVE)))
          .groupBy(Categories.id)
          .orderBy(asc(Categories.order));
      },
    }),

    pages: t.field({
      type: [PublicPage],
      resolve: async (site) => {
        return await db
          .select()
          .from(Pages)
          .where(and(eq(Pages.siteId, site.id), eq(Pages.state, PageState.PUBLISHED)))
          .orderBy(asc(Pages.id));
      },
    }),

    firstPage: t.field({
      type: PublicPage,
      nullable: true,
      resolve: async (site) => {
        return await db
          .select(getTableColumns(Pages))
          .from(Categories)
          .innerJoin(Pages, and(eq(Categories.id, Pages.categoryId), eq(Pages.state, PageState.PUBLISHED)))
          .where(and(eq(Categories.siteId, site.id), eq(Categories.state, CategoryState.ACTIVE)))
          .orderBy(asc(Categories.order), asc(Pages.order))
          .limit(1)
          .then(first);
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

  publicSite: t.withAuth({ site: true }).field({
    type: PublicSite,
    resolve: async (_, __, ctx) => {
      const site = await db
        .select()
        .from(Sites)
        .where(and(eq(Sites.id, ctx.site.id), eq(Sites.state, SiteState.ACTIVE)))
        .then(firstOrThrow);

      await assertTeamRestriction({
        siteId: site.id,
        type: TeamRestrictionType.USERSITE_READ,
      });

      return site;
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

      await assertTeamRestriction({
        teamId: input.teamId,
        type: TeamRestrictionType.DASHBOARD_WRITE,
      });

      return await db.transaction(async (tx) => {
        const slug = [
          faker.word.adjective({ length: { min: 3, max: 5 } }),
          faker.word.noun({ length: { min: 4, max: 6 } }),
          faker.string.numeric({ length: { min: 3, max: 4 } }),
        ].join('-');

        const templateSite = await tx
          .select({
            id: Sites.id,
            themeColor: Sites.themeColor,
          })
          .from(Sites)
          .where(eq(Sites.id, 'S0TEMPLATE'))
          .then(firstOrThrow);

        const site = await tx
          .insert(Sites)
          .values({
            teamId: input.teamId,
            name: input.name,
            slug,
            themeColor: templateSite.themeColor,
          })
          .returning()
          .then(firstOrThrow);

        const templateCategories = await tx
          .select({
            id: Categories.id,
            name: Categories.name,
            order: Categories.order,
          })
          .from(Categories)
          .where(and(eq(Categories.siteId, templateSite.id), eq(Categories.state, CategoryState.ACTIVE)))
          .orderBy(asc(Categories.order));

        const idMap: Record<string, string> = {};

        for (const templateCategory of templateCategories) {
          const category = await tx
            .insert(Categories)
            .values({
              siteId: site.id,
              name: templateCategory.name,
              order: templateCategory.order,
            })
            .returning({ id: Categories.id })
            .then(firstOrThrow);

          const templatePageParentIds: (string | null)[] = [null];

          while (templatePageParentIds.length > 0) {
            const templatePageParentId = templatePageParentIds.pop();
            if (templatePageParentId === undefined) {
              break;
            }

            const templatePages = await tx
              .select({
                id: Pages.id,
                categoryId: Pages.categoryId,
                order: Pages.order,
              })
              .from(Pages)
              .where(
                and(
                  eq(Pages.categoryId, templateCategory.id),
                  eq(Pages.state, PageState.PUBLISHED),
                  templatePageParentId === null ? isNull(Pages.parentId) : eq(Pages.parentId, templatePageParentId),
                ),
              )
              .orderBy(asc(Pages.order));

            for (const templatePage of templatePages) {
              templatePageParentIds.push(templatePage.id);

              const templatePageContent = await tx
                .select({
                  title: PageContents.title,
                  subtitle: PageContents.subtitle,
                  content: PageContents.content,
                  text: PageContents.text,
                  hash: PageContents.hash,
                })
                .from(PageContents)
                .where(eq(PageContents.pageId, templatePage.id))
                .then(firstOrThrow);

              const title = templatePageContent.title?.replaceAll('{siteName}', input.name);

              const doc = makeYDoc({
                title: title ?? null,
                subtitle: templatePageContent.subtitle,
                content: templatePageContent.content,
              });

              const page = await tx
                .insert(Pages)
                .values({
                  siteId: site.id,
                  categoryId: category.id,
                  parentId: templatePageParentId === null ? null : idMap[templatePageParentId],
                  order: templatePage.order,
                })
                .returning({ id: Pages.id })
                .then(firstOrThrow);

              idMap[templatePage.id] = page.id;

              await tx.insert(PageContentStates).values({
                pageId: page.id,
                title: title ?? null,
                subtitle: templatePageContent.subtitle,
                content: templatePageContent.content,
                text: templatePageContent.text,
                update: Y.encodeStateAsUpdateV2(doc),
                vector: Y.encodeStateVector(doc),
                hash: templatePageContent.hash,
              });

              await enqueueJob(tx, 'page:search:index-update', page.id);
            }
          }
        }

        pubsub.publish('team:update', input.teamId, { scope: 'team' });

        return site;
      });
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

      await assertTeamRestriction({
        siteId: input.siteId,
        type: TeamRestrictionType.DASHBOARD_WRITE,
      });

      const existingSite = await db
        .select({ id: Sites.id })
        .from(Sites)
        .where(and(eq(Sites.slug, input.slug), eq(Sites.state, SiteState.ACTIVE), ne(Sites.id, input.siteId)))
        .then(first);

      if (existingSite) {
        throw new ReadableError({ code: 'site_slug_exists' });
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

      await assertTeamRestriction({
        siteId: input.siteId,
        type: TeamRestrictionType.DASHBOARD_WRITE,
      });

      const existingDomain = await db
        .select({ id: SiteCustomDomains.id })
        .from(SiteCustomDomains)
        .where(
          and(
            eq(SiteCustomDomains.domain, input.domain),
            ne(SiteCustomDomains.siteId, input.siteId),
            eq(SiteCustomDomains.state, SiteCustomDomainState.ACTIVE),
          ),
        )
        .then(first);

      if (existingDomain) {
        throw new ReadableError({ code: 'site_custom_domain_exists' });
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

      await assertTeamRestriction({
        siteId: customDomain.siteId,
        type: TeamRestrictionType.DASHBOARD_WRITE,
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

      await assertTeamRestriction({
        siteId: input.siteId,
        type: TeamRestrictionType.DASHBOARD_WRITE,
      });

      const site = await db.transaction(async (tx) => {
        const deletedPageIds = await tx
          .update(Pages)
          .set({ state: PageState.DELETED })
          .where(eq(Pages.siteId, input.siteId))
          .returning({ id: Pages.id })
          .then((rows) => rows.map((row) => row.id));

        await tx.delete(SiteCustomDomains).where(eq(SiteCustomDomains.siteId, input.siteId));

        const site = await tx
          .update(Sites)
          .set({ state: SiteState.DELETED })
          .where(eq(Sites.id, input.siteId))
          .returning()
          .then(firstOrThrow);

        await Promise.all(deletedPageIds.map((pageId) => enqueueJob(tx, 'page:search:index-update', pageId)));

        return site;
      });

      pubsub.publish('team:update', site.teamId, { scope: 'team' });

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

      await assertTeamRestriction({
        siteId: customDomain.siteId,
        type: TeamRestrictionType.DASHBOARD_WRITE,
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
