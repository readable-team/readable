import { TRPCError } from '@trpc/server';
import { and, eq } from 'drizzle-orm';
import { db, first, Sites, WorkspaceMembers, Workspaces } from '@/db';
import { WorkspaceMemberRole, WorkspaceState } from '../enums';

type WorkspaceMemberRole = keyof typeof WorkspaceMemberRole;

const roleOrder: WorkspaceMemberRole[] = [WorkspaceMemberRole.MEMBER, WorkspaceMemberRole.ADMIN];

type CheckWorkspaceRoleOptions = {
  workspaceId: string;
  userId: string;
  role?: WorkspaceMemberRole;
  error?: Error | null;
};

export const checkWorkspaceRole = async ({
  workspaceId,
  userId,
  role = WorkspaceMemberRole.MEMBER,
  error,
}: CheckWorkspaceRoleOptions) => {
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

  if (!member || roleOrder.indexOf(member.role) < roleOrder.indexOf(role)) {
    if (error === null) {
      return false;
    } else {
      throw error === undefined ? new TRPCError({ code: 'FORBIDDEN' }) : error;
    }
  }

  return true;
};

type CheckSiteRoleOptions = {
  siteId: string;
  userId: string;
  role?: WorkspaceMemberRole;
  error?: Error | null;
};

export const checkSiteRole = async ({
  siteId,
  userId,
  role = WorkspaceMemberRole.MEMBER,
  error,
}: CheckSiteRoleOptions) => {
  // 사실 지금은 사이트별 권한이 없어서 워크스페이스 권한만 봄
  const member = await db
    .select({ role: WorkspaceMembers.role })
    .from(WorkspaceMembers)
    .innerJoin(Workspaces, eq(WorkspaceMembers.workspaceId, Workspaces.id))
    .innerJoin(Sites, eq(WorkspaceMembers.workspaceId, Sites.workspaceId))
    .where(and(eq(Sites.id, siteId), eq(WorkspaceMembers.userId, userId), eq(Workspaces.state, WorkspaceState.ACTIVE)))
    .then(first);

  if (!member || roleOrder.indexOf(member.role) < roleOrder.indexOf(role)) {
    if (error === null) {
      return false;
    } else {
      throw error === undefined ? new TRPCError({ code: 'FORBIDDEN' }) : error;
    }
  }
};
