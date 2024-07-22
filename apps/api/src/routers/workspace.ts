import { and, eq } from 'drizzle-orm';
import { db, first, firstOrThrow, Users, WorkspaceMembers, Workspaces } from '@/db';
import { WorkspaceMemberRole, WorkspaceState } from '@/enums';
import { inputSchemas } from '@/schemas';
import { router, sessionProcedure } from '@/trpc';

const createWorkspace = async (userId: string, workspaceName: string) => {
  return await db.transaction(async (tx) => {
    const workspace = await tx
      .insert(Workspaces)
      .values({ name: workspaceName })
      .returning({ id: Workspaces.id })
      .then(firstOrThrow);

    await tx.insert(WorkspaceMembers).values({
      workspaceId: workspace.id,
      userId,
      role: WorkspaceMemberRole.ADMIN,
    });

    return workspace;
  });
};

export const workspaceRouter = router({
  create: sessionProcedure.input(inputSchemas.workspace.create).mutation(async ({ input, ctx }) => {
    return await createWorkspace(ctx.session.userId, input.name);
  }),

  createDefault: sessionProcedure.mutation(async ({ ctx }) => {
    const user = await db
      .select({ name: Users.name })
      .from(Users)
      .where(eq(Users.id, ctx.session.userId))
      .then(firstOrThrow);

    const name = `${user.name}의 워크스페이스`;

    return await createWorkspace(ctx.session.userId, name);
  }),

  list: sessionProcedure.query(async ({ ctx }) => {
    return await db
      .select({ id: Workspaces.id, name: Workspaces.name })
      .from(Workspaces)
      .innerJoin(WorkspaceMembers, eq(Workspaces.id, WorkspaceMembers.workspaceId))
      .where(and(eq(WorkspaceMembers.userId, ctx.session.userId), eq(Workspaces.state, WorkspaceState.ACTIVE)));
  }),

  hasAny: sessionProcedure.query(async ({ ctx }) => {
    const workspace = await db
      .select({ id: Workspaces.id })
      .from(Workspaces)
      .innerJoin(WorkspaceMembers, eq(Workspaces.id, WorkspaceMembers.workspaceId))
      .where(and(eq(WorkspaceMembers.userId, ctx.session.userId), eq(Workspaces.state, WorkspaceState.ACTIVE)))
      .limit(1)
      .then(first);

    return !!workspace;
  }),
});
