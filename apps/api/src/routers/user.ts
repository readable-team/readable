import { TRPCError } from '@trpc/server';
import { and, eq } from 'drizzle-orm';
import { db, firstOrThrow, Users, UserSingleSignOns, WorkspaceMembers, Workspaces } from '@/db';
import { UserState, WorkspaceState } from '@/enums';
import { inputSchemas } from '@/schemas';
import { router, sessionProcedure } from '@/trpc';

export const userRouter = router({
  me: sessionProcedure.query(async ({ ctx }) => {
    return await db
      .select({ id: Users.id, email: Users.email, name: Users.name, avatarUrl: Users.avatarUrl })
      .from(Users)
      .where(eq(Users.id, ctx.session.userId))
      .then(firstOrThrow);
  }),

  update: sessionProcedure.input(inputSchemas.user.update).mutation(async ({ input, ctx }) => {
    await db
      .update(Users)
      .set({ name: input.name, avatarUrl: input.avatarUrl })
      .where(eq(Users.id, ctx.session.userId));
  }),

  delete: sessionProcedure.mutation(async ({ ctx }) => {
    const members = await db
      .select({ id: WorkspaceMembers.id })
      .from(WorkspaceMembers)
      .innerJoin(
        Workspaces,
        and(eq(WorkspaceMembers.workspaceId, Workspaces.id), eq(Workspaces.state, WorkspaceState.ACTIVE)),
      )
      .where(eq(WorkspaceMembers.userId, ctx.session.userId));

    if (members.length > 0) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: '아직 소속된 워크스페이스가 남아있습니다',
      });
    }

    await db.transaction(async (tx) => {
      await tx.delete(UserSingleSignOns).where(eq(UserSingleSignOns.userId, ctx.session.userId));
      await tx.update(Users).set({ state: UserState.DEACTIVATED }).where(eq(Users.id, ctx.session.userId));
    });
  }),
});
