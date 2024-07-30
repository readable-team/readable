import { TRPCError } from '@trpc/server';
import { and, eq } from 'drizzle-orm';
import { db, firstOrThrow, Users, UserSessions, UserSingleSignOns, WorkspaceMembers, Workspaces } from '@/db';
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

  deactivate: sessionProcedure.mutation(async ({ ctx }) => {
    const members = await db
      .select({ id: WorkspaceMembers.id })
      .from(WorkspaceMembers)
      .innerJoin(Workspaces, eq(WorkspaceMembers.workspaceId, Workspaces.id))
      .where(and(eq(WorkspaceMembers.userId, ctx.session.userId), eq(Workspaces.state, WorkspaceState.ACTIVE)));

    if (members.length > 0) {
      throw new TRPCError({
        code: 'PRECONDITION_FAILED',
        message: '아직 소속된 워크스페이스가 남아있어요',
      });
    }

    await db.transaction(async (tx) => {
      await tx.delete(UserSessions).where(eq(UserSessions.userId, ctx.session.userId));
      await tx.delete(UserSingleSignOns).where(eq(UserSingleSignOns.userId, ctx.session.userId));
      await tx.update(Users).set({ state: UserState.DEACTIVATED }).where(eq(Users.id, ctx.session.userId));
    });
  }),
});
