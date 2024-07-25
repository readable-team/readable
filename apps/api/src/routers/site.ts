import { faker } from '@faker-js/faker';
import { TRPCError } from '@trpc/server';
import { and, asc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db, first, firstOrThrow, Sites } from '@/db';
import { SiteState, WorkspaceMemberRole } from '@/enums';
import { inputSchemas } from '@/schemas';
import { router, sessionProcedure } from '@/trpc';
import { checkSiteRole, checkWorkspaceRole } from '@/utils/role';

export const siteRouter = router({
  create: sessionProcedure
    .input(inputSchemas.site.create.extend({ workspaceId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await checkWorkspaceRole({
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

  list: sessionProcedure.input(z.object({ workspaceId: z.string() })).query(async ({ input, ctx }) => {
    await checkWorkspaceRole({
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
      await checkSiteRole({
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
});
