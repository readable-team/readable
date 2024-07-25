import { createId } from '@paralleldrive/cuid2';
import { TRPCError } from '@trpc/server';
import dayjs from 'dayjs';
import { and, asc, count, eq, gt } from 'drizzle-orm';
import { z } from 'zod';
import { db, first, firstOrThrow, Users, WorkspaceInvites, WorkspaceMembers, Workspaces } from '@/db';
import { sendEmail } from '@/email';
import WorkspaceInvite from '@/email/workspace-invite';
import { WorkspaceMemberRole, WorkspaceState } from '@/enums';
import { inputSchemas } from '@/schemas';
import { router, sessionProcedure } from '@/trpc';
import { checkWorkspaceRole } from '@/utils/role';

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
      .where(and(eq(WorkspaceMembers.userId, ctx.session.userId), eq(Workspaces.state, WorkspaceState.ACTIVE)))
      .orderBy(asc(Workspaces.createdAt));
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

  inviteMember: sessionProcedure
    .input(inputSchemas.workspace.inviteMember.extend({ workspaceId: z.string() }))
    .query(async ({ input, ctx }) => {
      await checkWorkspaceRole({
        workspaceId: input.workspaceId,
        userId: ctx.session.userId,
        role: 'ADMIN',
      });

      const [inviter, workspace, invitee] = await Promise.all([
        db.select({ name: Users.name }).from(Users).where(eq(Users.id, ctx.session.userId)).then(firstOrThrow),
        db
          .select({ name: Workspaces.name })
          .from(Workspaces)
          .where(eq(Workspaces.id, input.workspaceId))
          .then(firstOrThrow),
        db.select({ id: Users.id, name: Users.name }).from(Users).where(eq(Users.email, input.email)).then(first),
      ]);

      const code = createId();

      await db.insert(WorkspaceInvites).values({
        workspaceId: input.workspaceId,
        inviterId: ctx.session.userId,
        inviteeId: invitee?.id,
        code,
        email: input.email,
        expiresAt: dayjs().add(1, 'day'),
      });

      await sendEmail({
        recipient: input.email,
        subject: `[Readable] ${inviter.name}님이 워크스페이스에 초대했습니다`,
        body: WorkspaceInvite({
          inviterName: inviter.name,
          workspaceName: workspace.name,
        }),
      });
    }),

  acceptMemberInvitation: sessionProcedure.input(z.object({ code: z.string() })).mutation(async ({ input, ctx }) => {
    const invite = await db
      .select({ workspaceId: WorkspaceInvites.workspaceId, inviterId: WorkspaceInvites.inviterId })
      .from(WorkspaceInvites)
      .where(and(eq(WorkspaceInvites.code, input.code), gt(WorkspaceInvites.expiresAt, dayjs())))
      .then(firstOrThrow);

    if (
      !(await checkWorkspaceRole({
        workspaceId: invite.workspaceId,
        userId: ctx.session.userId,
        error: null,
      }))
    ) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: '이미 해당 워크스페이스에 가입되어 있습니다',
      });
    }

    await db.transaction(async (tx) => {
      await tx.insert(WorkspaceMembers).values({
        workspaceId: invite.workspaceId,
        userId: ctx.session.userId,
        role: WorkspaceMemberRole.MEMBER,
      });

      await tx.delete(WorkspaceInvites).where(eq(WorkspaceInvites.code, input.code));
    });
  }),

  updateMemberRole: sessionProcedure
    .input(z.object({ workspaceId: z.string(), userId: z.string(), role: z.nativeEnum(WorkspaceMemberRole) }))
    .mutation(async ({ input, ctx }) => {
      await checkWorkspaceRole({
        workspaceId: input.workspaceId,
        userId: ctx.session.userId,
        role: 'ADMIN',
      });

      await db.transaction(async (tx) => {
        await tx
          .update(WorkspaceMembers)
          .set({ role: input.role })
          .where(and(eq(WorkspaceMembers.workspaceId, input.workspaceId), eq(WorkspaceMembers.userId, input.userId)));

        if (input.role !== 'ADMIN') {
          const adminCount = await db
            .select({ count: count(WorkspaceMembers.id) })
            .from(WorkspaceMembers)
            .where(and(eq(WorkspaceMembers.workspaceId, input.workspaceId), eq(WorkspaceMembers.role, 'ADMIN')))
            .then((rows) => rows[0]?.count ?? 0);

          if (adminCount === 0) {
            throw new TRPCError({
              code: 'CONFLICT',
              message: '워크스페이스에는 최소 1명의 관리자가 있어야 합니다',
            });
          }
        }
      });
    }),
});
