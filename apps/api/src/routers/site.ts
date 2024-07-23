import { faker } from '@faker-js/faker';
import { and, asc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db, firstOrThrow, Sites, WorkspaceMembers, Workspaces } from '@/db';
import { SiteState, WorkspaceMemberRole, WorkspaceState } from '@/enums';
import { inputSchemas } from '@/schemas';
import { router, sessionProcedure } from '@/trpc';

export const siteRouter = router({
  create: sessionProcedure
    .input(inputSchemas.site.create.extend({ workspaceId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await db
        .select({ role: WorkspaceMembers.role })
        .from(WorkspaceMembers)
        .where(
          and(
            eq(WorkspaceMembers.workspaceId, input.workspaceId),
            eq(WorkspaceMembers.userId, ctx.session.userId),
            eq(WorkspaceMembers.role, WorkspaceMemberRole.ADMIN),
          ),
        )
        .then(firstOrThrow);

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
    await db
      .select({ id: Workspaces.id })
      .from(Workspaces)
      .innerJoin(WorkspaceMembers, eq(Workspaces.id, WorkspaceMembers.workspaceId))
      .where(
        and(
          eq(WorkspaceMembers.userId, ctx.session.userId),
          eq(Workspaces.id, input.workspaceId),
          eq(Workspaces.state, WorkspaceState.ACTIVE),
        ),
      )
      .then(firstOrThrow);

    return await db
      .select({ id: Sites.id, name: Sites.name, slug: Sites.slug })
      .from(Sites)
      .where(and(eq(Sites.workspaceId, input.workspaceId), eq(Sites.state, SiteState.ACTIVE)))
      .orderBy(asc(Sites.name));
  }),
});
