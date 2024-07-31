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
import { dataSchemas } from '@/schemas';
import { assertWorkspacePermission } from '@/utils/permissions';
import { Site, User, Workspace, WorkspaceMember, WorkspaceMemberInvitation } from './objects';

/**
 * * Types
 */

Workspace.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),

    members: t.field({
      type: [WorkspaceMember],
      resolve: async (workspace) => {
        return await db
          .select()
          .from(WorkspaceMembers)
          .where(eq(WorkspaceMembers.workspaceId, workspace.id))
          .orderBy(asc(WorkspaceMembers.createdAt));
      },
    }),

    sites: t.field({
      type: [Site],
      resolve: async (workspace) => {
        return await db
          .select()
          .from(Sites)
          .where(and(eq(Sites.workspaceId, workspace.id), eq(Sites.state, SiteState.ACTIVE)))
          .orderBy(asc(Sites.name));
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
    email: t.exposeString('email'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
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
}));

/**
 * * Mutations
 */

builder.mutationFields((t) => ({
  createWorkspace: t.withAuth({ session: true }).fieldWithInput({
    type: Workspace,
    input: { name: t.input.string({ validate: { schema: dataSchemas.workspace.name } }) },
    resolve: async (_, { input }, ctx) => {
      return await createWorkspace(ctx.session.userId, input.name);
    },
  }),

  createDefaultWorkspace: t.withAuth({ session: true }).field({
    type: Workspace,
    resolve: async (_, __, ctx) => {
      const user = await db
        .select({ name: Users.name })
        .from(Users)
        .where(eq(Users.id, ctx.session.userId))
        .then(firstOrThrow);

      return await createWorkspace(ctx.session.userId, `${user.name}의 워크스페이스`);
    },
  }),

  deleteWorkspace: t.withAuth({ session: true }).fieldWithInput({
    type: Workspace,
    input: { workspaceId: t.input.string() },
    resolve: async (_, { input }, ctx) => {
      await assertWorkspacePermission({
        workspaceId: input.workspaceId,
        userId: ctx.session.userId,
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
    input: { workspaceId: t.input.string(), email: t.input.string({ validate: { schema: dataSchemas.email } }) },
    resolve: async (_, { input }, ctx) => {
      await assertWorkspacePermission({
        workspaceId: input.workspaceId,
        userId: ctx.session.userId,
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
    resolve: async (_, { input }, ctx) => {
      await assertWorkspacePermission({
        workspaceId: input.workspaceId,
        userId: ctx.session.userId,
        role: input.userId == ctx.session.userId ? WorkspaceMemberRole.MEMBER : WorkspaceMemberRole.ADMIN,
      });

      return await db.transaction(async (tx) => {
        const member = await tx
          .delete(WorkspaceMembers)
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

  updateWorkspaceMemberRole: t.withAuth({ session: true }).fieldWithInput({
    type: WorkspaceMember,
    input: {
      workspaceId: t.input.string(),
      userId: t.input.string(),
      role: t.input.field({ type: WorkspaceMemberRole }),
    },
    resolve: async (_, { input }, ctx) => {
      await assertWorkspacePermission({
        workspaceId: input.workspaceId,
        userId: ctx.session.userId,
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
