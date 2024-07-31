import { faker } from '@faker-js/faker';
import { and, asc, eq, isNull, ne } from 'drizzle-orm';
import { builder } from '@/builder';
import { db, first, firstOrThrow, Pages, Sites } from '@/db';
import { PageState, SiteState, WorkspaceMemberRole } from '@/enums';
import { env } from '@/env';
import { ApiError } from '@/errors';
import { assertSitePermission, assertWorkspacePermission } from '@/utils/permissions';
import { Page, Site } from './objects';

/**
 * * Types
 */

Site.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),

    url: t.string({ resolve: (site) => `https://${site.slug}.${env.USERSITE_DEFAULT_HOST}` }),

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
}));

/**
 * * Mutations
 */

builder.mutationFields((t) => ({
  createSite: t.withAuth({ session: true }).fieldWithInput({
    type: Site,
    input: { workspaceId: t.input.id(), name: t.input.string() },
    resolve: async (_, { input }, ctx) => {
      await assertWorkspacePermission({
        workspaceId: input.workspaceId,
        userId: ctx.session.userId,
        role: WorkspaceMemberRole.ADMIN,
      });

      const slug = [
        faker.word.adjective({ length: { min: 3, max: 5 } }),
        faker.word.noun({ length: { min: 4, max: 6 } }),
        faker.string.numeric({ length: { min: 3, max: 4 } }),
      ].join('-');

      const site = await db
        .insert(Sites)
        .values({
          workspaceId: input.workspaceId,
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
    input: { siteId: t.input.id(), name: t.input.string(), slug: t.input.string() },
    resolve: async (_, { input }, ctx) => {
      await assertSitePermission({
        siteId: input.siteId,
        userId: ctx.session.userId,
        role: WorkspaceMemberRole.ADMIN,
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
        .set({ name: input.name, slug: input.slug })
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
        role: WorkspaceMemberRole.ADMIN,
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
