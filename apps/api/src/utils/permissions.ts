import { TRPCError } from '@trpc/server';
import { and, eq } from 'drizzle-orm';
import { db, first, Sites, WorkspaceMembers, Workspaces } from '@/db';
import { SiteState, WorkspaceMemberRole, WorkspaceState } from '@/enums';

const workspaceMemberRolePrecedences: WorkspaceMemberRole[] = [WorkspaceMemberRole.MEMBER, WorkspaceMemberRole.ADMIN];

type AssertWorkspacePermissionParams = {
  workspaceId: string;
  userId: string;
  role?: WorkspaceMemberRole;
};

export const assertWorkspacePermission = async ({
  workspaceId,
  userId,
  role = WorkspaceMemberRole.MEMBER,
}: AssertWorkspacePermissionParams) => {
  const member = await db
    .select({ role: WorkspaceMembers.role })
    .from(WorkspaceMembers)
    .innerJoin(Workspaces, eq(WorkspaceMembers.workspaceId, Workspaces.id))
    .where(
      and(
        eq(WorkspaceMembers.workspaceId, workspaceId),
        eq(WorkspaceMembers.userId, userId),
        eq(Workspaces.state, WorkspaceState.ACTIVE),
      ),
    )
    .then(first);

  if (!member || workspaceMemberRolePrecedences.indexOf(member.role) < workspaceMemberRolePrecedences.indexOf(role)) {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }
};

type AssertSitePermissionParams = {
  siteId: string;
  userId: string;
  role?: WorkspaceMemberRole;
};

export const assertSitePermission = async ({
  siteId,
  userId,
  role = WorkspaceMemberRole.MEMBER,
}: AssertSitePermissionParams) => {
  // 사실 지금은 사이트별 권한이 없어서 워크스페이스 권한만 봄
  const member = await db
    .select({ role: WorkspaceMembers.role })
    .from(WorkspaceMembers)
    .innerJoin(Workspaces, eq(WorkspaceMembers.workspaceId, Workspaces.id))
    .innerJoin(Sites, eq(WorkspaceMembers.workspaceId, Sites.workspaceId))
    .where(
      and(
        eq(Sites.id, siteId),
        eq(WorkspaceMembers.userId, userId),
        eq(Workspaces.state, WorkspaceState.ACTIVE),
        eq(Sites.state, SiteState.ACTIVE),
      ),
    )
    .then(first);

  if (!member || workspaceMemberRolePrecedences.indexOf(member.role) < workspaceMemberRolePrecedences.indexOf(role)) {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }
};
