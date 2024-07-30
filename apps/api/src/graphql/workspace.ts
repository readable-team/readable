import { TRPCError } from '@trpc/server';
import dayjs from 'dayjs';
import { and, asc, count, eq } from 'drizzle-orm';
import { z } from 'zod';
import { builder } from '@/builder';
import { db, first, firstOrThrow, Sites, Users, WorkspaceMemberInvitations, WorkspaceMembers, Workspaces } from '@/db';
import { sendEmail } from '@/email';
import WorkspaceMemberAddedEmail from '@/email/templates/WorkspaceMemberAdded.tsx';
import WorkspaceMemberInvitedEmail from '@/email/templates/WorkspaceMemberInvited.tsx';
import { SiteState, UserState, WorkspaceMemberRole, WorkspaceState } from '@/enums';
import { env } from '@/env';
import { inputSchemas } from '@/schemas';
import { assertWorkspacePermission } from '@/utils/permissions';
import {
  WorkspaceMemberAlreadyExistsFailure,
  WorkspaceMemberRequiredFailure,
  WorkspaceNotEmptyFailure,
} from './failures';
import { User, Workspace, WorkspaceMember, WorkspaceMemberInvitation } from './objects';

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

/**
 * * Types
 */

Workspace.implement({
  fields: (t) => ({
    name: t.exposeString('name'),
    state: t.expose('state', { type: WorkspaceState }),

    members: t.withAuth({ session: true }).field({
      type: [WorkspaceMember],
      resolve: async (workspace, _, { session }) => {
        await assertWorkspacePermission({
          workspaceId: workspace.id,
          userId: session.userId,
        });

        return await db.select().from(WorkspaceMembers).where(eq(WorkspaceMembers.workspaceId, workspace.id));
      },
    }),
  }),
});

WorkspaceMember.implement({
  fields: (t) => ({
    role: t.expose('role', { type: WorkspaceMemberRole }),

    user: t.field({ type: User, resolve: (member) => member.userId }),
  }),
});

/**
 * * Queries
 */

builder.queryFields((t) => ({
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
  hasAnyWorkspace: t.withAuth({ session: true }).boolean({
    resolve: async (_, __, { session }) => {
      const workspace = await db
        .select({ id: Workspaces.id })
        .from(Workspaces)
        .innerJoin(WorkspaceMembers, eq(Workspaces.id, WorkspaceMembers.workspaceId))
        .where(and(eq(WorkspaceMembers.userId, session.userId), eq(Workspaces.state, WorkspaceState.ACTIVE)))
        .limit(1)
        .then(first);

      return !!workspace;
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
    validate: { schema: z.object({ input: inputSchemas.workspace.create }) },
    errors: { dataField: { name: 'workspace' } },
    resolve: async (_, { input }, { session }) => {
      return await createWorkspace(session.userId, input.name);
    },
  }),

  createDefaultWorkspace: t.withAuth({ session: true }).field({
    type: Workspace,
    errors: { dataField: { name: 'workspace' } },
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
    errors: { dataField: { name: 'workspace' }, types: [WorkspaceNotEmptyFailure] },
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
        throw new WorkspaceNotEmptyFailure(sites.map((site) => site.id));
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
    type: t.builder.unionType('MemberOrInvitation', {
      types: [WorkspaceMember, WorkspaceMemberInvitation],
      resolveType: (object) => ('expiresAt' in object ? WorkspaceMemberInvitation : WorkspaceMember),
    }),
    input: { workspaceId: t.input.string(), email: t.input.string() },
    validate: { schema: z.object({ input: inputSchemas.workspace.inviteMember.extend({ workspaceId: z.string() }) }) },
    errors: { dataField: { name: 'memberOrInvitation' }, types: [WorkspaceMemberAlreadyExistsFailure] },
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
          throw new WorkspaceMemberAlreadyExistsFailure(existingMember.id);
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
    errors: { dataField: { name: 'member' } },
    resolve: async (_, { input }, { session }) => {
      await assertWorkspacePermission({
        workspaceId: input.workspaceId,
        userId: session.userId,
        role: WorkspaceMemberRole.ADMIN,
      });

      if (input.userId === session.userId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: '자기 자신을 워크스페이스에서 제거할 수 없어요',
        });
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
    errors: { dataField: { name: 'member' } },
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
          throw new WorkspaceMemberRequiredFailure();
        }

        return member;
      });
    },
  }),
}));
