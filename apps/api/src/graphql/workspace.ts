import dayjs from 'dayjs';
import { and, asc, count, eq } from 'drizzle-orm';
import { builder } from '@/builder';
import { db, first, firstOrThrow, Sites, Users, WorkspaceMemberInvitations, WorkspaceMembers, Workspaces } from '@/db';
import { sendEmail } from '@/email';
import WorkspaceMemberAddedEmail from '@/email/templates/WorkspaceMemberAdded.tsx';
import WorkspaceMemberInvitedEmail from '@/email/templates/WorkspaceMemberInvited.tsx';
import { SiteState, UserState, WorkspaceMemberRole, WorkspaceState } from '@/enums';
import { env } from '@/env';
import { ApiError } from '@/errors';
import { assertWorkspacePermission } from '@/utils/permissions';
import { Site, User, Workspace, WorkspaceMember, WorkspaceMemberInvitation } from './objects';

/**
 * * Types
 */

Workspace.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    state: t.expose('state', { type: WorkspaceState }),

    members: t.field({
      type: [WorkspaceMember],
      resolve: async (workspace) => {
        return await db.select().from(WorkspaceMembers).where(eq(WorkspaceMembers.workspaceId, workspace.id));
      },
    }),

    sites: t.field({
      type: [Site],
      resolve: async (workspace) => {
        return await db
          .select()
          .from(Sites)
          .where(and(eq(Sites.workspaceId, workspace.id), eq(Sites.state, SiteState.ACTIVE)));
      },
    }),
  }),
});

WorkspaceMember.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    role: t.expose('role', { type: WorkspaceMemberRole }),

    user: t.field({ type: User, resolve: (member) => member.userId }),
  }),
});

WorkspaceMemberInvitation.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
  }),
});

/**
 * * Queries
 */

builder.queryFields((t) => ({
  workspace: t.withAuth({ session: true }).field({
    type: Workspace,
    args: { workspaceId: t.arg.id() },
    resolve: async (_, { workspaceId }, ctx) => {
      await assertWorkspacePermission({
        workspaceId,
        userId: ctx.session.userId,
      });

      return await db.select().from(Workspaces).where(eq(Workspaces.id, workspaceId)).then(firstOrThrow);
    },
  }),

  workspaces: t.withAuth({ session: true }).field({
    type: [Workspace],
    resolve: async (_, __, { session }) => {
      return await db
        .select({ id: Workspaces.id })
        .from(Workspaces)
        .innerJoin(WorkspaceMembers, eq(Workspaces.id, WorkspaceMembers.workspaceId))
        .where(and(eq(WorkspaceMembers.userId, session.userId), eq(Workspaces.state, WorkspaceState.ACTIVE)))
        .orderBy(asc(Workspaces.createdAt))
        .then((workspaces) => workspaces.map((workspace) => workspace.id));
    },
  }),
}));

/**
 * * Mutations
 */

builder.mutationFields((t) => ({
  createWorkspace: t.withAuth({ session: true }).fieldWithInput({
    type: Workspace,
    input: { name: t.input.string() },
    resolve: async (_, { input }, { session }) => {
      return await createWorkspace(session.userId, input.name);
    },
  }),

  createDefaultWorkspace: t.withAuth({ session: true }).field({
    type: Workspace,
    resolve: async (_, __, { session }) => {
      const user = await db
        .select({ name: Users.name })
        .from(Users)
        .where(eq(Users.id, session.userId))
        .then(firstOrThrow);

      return await createWorkspace(session.userId, `${user.name}의 워크스페이스`);
    },
  }),

  deleteWorkspace: t.withAuth({ session: true }).fieldWithInput({
    type: Workspace,
    input: { workspaceId: t.input.string() },
    resolve: async (_, { input }, { session }) => {
      await assertWorkspacePermission({
        workspaceId: input.workspaceId,
        userId: session.userId,
        role: 'ADMIN',
      });

      const sites = await db
        .select({ id: Sites.id })
        .from(Sites)
        .where(and(eq(Sites.workspaceId, input.workspaceId), eq(Sites.state, SiteState.ACTIVE)));

      if (sites.length > 0) {
        throw new ApiError({ code: 'workspace_has_sites' });
      }

      return await db
        .update(Workspaces)
        .set({ state: WorkspaceState.DELETED })
        .where(eq(Workspaces.id, input.workspaceId))
        .returning()
        .then(firstOrThrow);
    },
  }),

  inviteWorkspaceMember: t.withAuth({ session: true }).fieldWithInput({
    type: t.builder.unionType('InviteWorkspaceMemberResult', {
      types: [WorkspaceMember, WorkspaceMemberInvitation],
      resolveType: (object) => ('expiresAt' in object ? WorkspaceMemberInvitation : WorkspaceMember),
    }),
    input: { workspaceId: t.input.string(), email: t.input.string() },
    resolve: async (_, { input }, { session }) => {
      await assertWorkspacePermission({
        workspaceId: input.workspaceId,
        userId: session.userId,
        role: WorkspaceMemberRole.ADMIN,
      });

      const invitedUser = await db
        .select({ id: Users.id })
        .from(Users)
        .where(and(eq(Users.email, input.email), eq(Users.state, UserState.ACTIVE)))
        .then(first);

      const workspace = await db
        .select({ name: Workspaces.name })
        .from(Workspaces)
        .where(eq(Workspaces.id, input.workspaceId))
        .then(firstOrThrow);

      if (invitedUser) {
        const existingMember = await db
          .select({ id: WorkspaceMembers.id })
          .from(WorkspaceMembers)
          .where(and(eq(WorkspaceMembers.workspaceId, input.workspaceId), eq(WorkspaceMembers.userId, invitedUser.id)))
          .then(first);

        if (existingMember) {
          throw new ApiError({ code: 'workspace_member_exists' });
        }

        const member = await db
          .insert(WorkspaceMembers)
          .values({
            workspaceId: input.workspaceId,
            userId: invitedUser.id,
            role: WorkspaceMemberRole.MEMBER,
          })
          .onConflictDoNothing()
          .returning()
          .then(firstOrThrow);

        await sendEmail({
          recipient: input.email,
          subject: `[Readable] ${workspace.name}에 추가되었어요`,
          body: WorkspaceMemberAddedEmail({
            dashboardUrl: env.DASHBOARD_URL,
            workspaceId: input.workspaceId,
            workspaceName: workspace.name,
          }),
        });

        return member;
      } else {
        const invitation = await db
          .insert(WorkspaceMemberInvitations)
          .values({
            workspaceId: input.workspaceId,
            email: input.email,
            expiresAt: dayjs().add(1, 'day'),
          })
          .returning()
          .then(firstOrThrow);

        await sendEmail({
          recipient: input.email,
          subject: `[Readable] ${workspace.name}에 참여하세요`,
          body: WorkspaceMemberInvitedEmail({
            dashboardUrl: env.DASHBOARD_URL,
            workspaceName: workspace.name,
          }),
        });

        return invitation;
      }
    },
  }),

  removeWorkspaceMember: t.withAuth({ session: true }).fieldWithInput({
    type: WorkspaceMember,
    input: { workspaceId: t.input.string(), userId: t.input.string() },
    resolve: async (_, { input }, { session }) => {
      await assertWorkspacePermission({
        workspaceId: input.workspaceId,
        userId: session.userId,
        role: WorkspaceMemberRole.ADMIN,
      });

      if (input.userId === session.userId) {
        throw new ApiError({ code: 'workspace_cannot_remove_self' });
      }

      return await db
        .delete(WorkspaceMembers)
        .where(and(eq(WorkspaceMembers.workspaceId, input.workspaceId), eq(WorkspaceMembers.userId, input.userId)))
        .returning()
        .then(firstOrThrow);
    },
  }),

  updateWorkspaceMemberRole: t.withAuth({ session: true }).fieldWithInput({
    type: WorkspaceMember,
    input: {
      workspaceId: t.input.string(),
      userId: t.input.string(),
      role: t.input.field({ type: WorkspaceMemberRole }),
    },
    resolve: async (_, { input }, { session }) => {
      await assertWorkspacePermission({
        workspaceId: input.workspaceId,
        userId: session.userId,
        role: WorkspaceMemberRole.ADMIN,
      });

      return await db.transaction(async (tx) => {
        const member = await tx
          .update(WorkspaceMembers)
          .set({ role: input.role })
          .where(and(eq(WorkspaceMembers.workspaceId, input.workspaceId), eq(WorkspaceMembers.userId, input.userId)))
          .returning()
          .then(firstOrThrow);

        const adminCount = await tx
          .select({ count: count(WorkspaceMembers.id) })
          .from(WorkspaceMembers)
          .where(
            and(
              eq(WorkspaceMembers.workspaceId, input.workspaceId),
              eq(WorkspaceMembers.role, WorkspaceMemberRole.ADMIN),
            ),
          )
          .then(first);

        if (adminCount?.count === 0) {
          throw new ApiError({ code: 'workspace_needs_admin' });
        }

        return member;
      });
    },
  }),
}));

/**
 * * Utils
 */

const createWorkspace = async (userId: string, workspaceName: string) => {
  return await db.transaction(async (tx) => {
    const workspace = await tx.insert(Workspaces).values({ name: workspaceName }).returning().then(firstOrThrow);

    await tx.insert(WorkspaceMembers).values({
      workspaceId: workspace.id,
      userId,
      role: WorkspaceMemberRole.ADMIN,
    });

    return workspace;
  });
};
