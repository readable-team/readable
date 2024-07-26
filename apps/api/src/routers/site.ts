import { faker } from '@faker-js/faker';
import { TRPCError } from '@trpc/server';
import { and, asc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db, first, firstOrThrow, Sites, WorkspaceMembers, Workspaces } from '@/db';
import { SiteState, WorkspaceMemberRole, WorkspaceState } from '@/enums';
import { inputSchemas } from '@/schemas';
import { router, sessionProcedure } from '@/trpc';
import { assertSitePermission, assertWorkspacePermission } from '@/utils/permissions';

export const siteRouter = router({
  create: sessionProcedure
    .input(inputSchemas.site.create.extend({ workspaceId: z.string() }))
    .mutation(async ({ input, ctx }) => {
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
        .returning({ id: Sites.id })
        .then(firstOrThrow);

      return site;
    }),

  get: sessionProcedure.input(z.object({ siteId: z.string() })).query(async ({ input, ctx }) => {
    const site = await db
      .select({
        id: Sites.id,
        name: Sites.name,
        slug: Sites.slug,
        workspaceId: Sites.workspaceId,
      })
      .from(Sites)
      .innerJoin(Workspaces, eq(Sites.workspaceId, Workspaces.id))
      .leftJoin(
        WorkspaceMembers,
        and(eq(WorkspaceMembers.userId, ctx.session.userId), eq(WorkspaceMembers.workspaceId, Sites.workspaceId)),
      )
      .where(
        and(eq(Sites.id, input.siteId), eq(Sites.state, SiteState.ACTIVE), eq(Workspaces.state, WorkspaceState.ACTIVE)),
      )
      .then(firstOrThrow);

    return {
      ...site,
      // TODO: 나중에 릴리즈 환경 & 커스텀 도메인 고려 필요
      url: `https://${site.slug}.rdbl.ninja`,
    };
  }),

  list: sessionProcedure.input(z.object({ workspaceId: z.string() })).query(async ({ input, ctx }) => {
    await assertWorkspacePermission({
      workspaceId: input.workspaceId,
      userId: ctx.session.userId,
    });

    return await db
      .select({ id: Sites.id, name: Sites.name, slug: Sites.slug })
      .from(Sites)
      .where(and(eq(Sites.workspaceId, input.workspaceId), eq(Sites.state, SiteState.ACTIVE)))
      .orderBy(asc(Sites.name));
  }),

  update: sessionProcedure
    .input(inputSchemas.site.update.extend({ siteId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await assertSitePermission({
        siteId: input.siteId,
        userId: ctx.session.userId,
        role: WorkspaceMemberRole.ADMIN,
      });

      const slugConflict = await db
        .select({ id: Sites.id })
        .from(Sites)
        .where(and(eq(Sites.slug, input.slug), eq(Sites.state, SiteState.ACTIVE)))
        .then(first);

      if (slugConflict) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: '이미 다른 사이트에서 사용 중인 slug입니다',
        });
      }

      await db.update(Sites).set({ name: input.name, slug: input.slug }).where(eq(Sites.id, input.siteId));
    }),

  delete: sessionProcedure.input(z.object({ siteId: z.string() })).mutation(async ({ input, ctx }) => {
    await assertSitePermission({
      siteId: input.siteId,
      userId: ctx.session.userId,
      role: WorkspaceMemberRole.ADMIN,
    });

    await db.update(Sites).set({ state: SiteState.DELETED }).where(eq(Sites.id, input.siteId));
  }),
});
