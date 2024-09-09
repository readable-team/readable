import { and, eq } from 'drizzle-orm';
import { Categories, db, first, Pages, Sites, TeamMembers, Teams } from '@/db';
import { SiteState, TeamMemberRole, TeamState } from '@/enums';
import { ReadableError } from '@/errors';

export const throwableToBoolean = <T extends unknown[]>(
  fn: (...args: T) => Promise<void>,
): ((...args: T) => Promise<boolean>) => {
  return (...args: T) =>
    fn(...args)
      .then(() => true)
      .catch(() => false);
};

const teamMemberRolePrecedences: TeamMemberRole[] = [TeamMemberRole.MEMBER, TeamMemberRole.ADMIN];

type AssertTeamPermissionParams = {
  teamId: string;
  userId?: string;
  role?: TeamMemberRole;
};

export const assertTeamPermission = async ({
  teamId,
  userId,
  role = TeamMemberRole.MEMBER,
}: AssertTeamPermissionParams) => {
  if (!userId) {
    throw new ReadableError({ code: 'unauthorized' });
  }

  const member = await db
    .select({ role: TeamMembers.role })
    .from(TeamMembers)
    .innerJoin(Teams, eq(TeamMembers.teamId, Teams.id))
    .where(and(eq(TeamMembers.teamId, teamId), eq(TeamMembers.userId, userId), eq(Teams.state, TeamState.ACTIVE)))
    .then(first);

  if (!member || teamMemberRolePrecedences.indexOf(member.role) < teamMemberRolePrecedences.indexOf(role)) {
    throw new ReadableError({ code: 'forbidden' });
  }
};

type AssertSitePermissionParams = {
  siteId: string;
  userId?: string;
  role?: TeamMemberRole;
};

export const assertSitePermission = async ({
  siteId,
  userId,
  role = TeamMemberRole.MEMBER,
}: AssertSitePermissionParams) => {
  // 사실 지금은 사이트별 권한이 없어서 팀 권한만 봄
  if (!userId) {
    throw new ReadableError({ code: 'unauthorized' });
  }

  const member = await db
    .select({ role: TeamMembers.role })
    .from(TeamMembers)
    .innerJoin(Teams, eq(TeamMembers.teamId, Teams.id))
    .innerJoin(Sites, eq(TeamMembers.teamId, Sites.teamId))
    .where(
      and(
        eq(Sites.id, siteId),
        eq(TeamMembers.userId, userId),
        eq(Teams.state, TeamState.ACTIVE),
        eq(Sites.state, SiteState.ACTIVE),
      ),
    )
    .then(first);

  if (!member || teamMemberRolePrecedences.indexOf(member.role) < teamMemberRolePrecedences.indexOf(role)) {
    throw new ReadableError({ code: 'forbidden' });
  }
};

type AssertCategoryPermissionParams = {
  categoryId: string;
  userId?: string;
  role?: TeamMemberRole;
};

export const assertCategoryPermission = async ({
  categoryId,
  userId,
  role = TeamMemberRole.MEMBER,
}: AssertCategoryPermissionParams) => {
  if (!userId) {
    throw new ReadableError({ code: 'unauthorized' });
  }

  const member = await db
    .select({ role: TeamMembers.role })
    .from(TeamMembers)
    .innerJoin(Teams, eq(TeamMembers.teamId, Teams.id))
    .innerJoin(Sites, eq(Teams.id, Sites.teamId))
    .innerJoin(Categories, eq(Categories.siteId, Sites.id))
    .where(
      and(
        eq(Categories.id, categoryId),
        eq(TeamMembers.userId, userId),
        eq(Teams.state, TeamState.ACTIVE),
        eq(Sites.state, SiteState.ACTIVE),
      ),
    )
    .then(first);

  if (!member || teamMemberRolePrecedences.indexOf(member.role) < teamMemberRolePrecedences.indexOf(role)) {
    throw new ReadableError({ code: 'forbidden' });
  }
};

type AssertPagePermissionParams = {
  pageId: string;
  userId?: string;
  role?: TeamMemberRole;
};

export const assertPagePermission = async ({
  pageId,
  userId,
  role = TeamMemberRole.MEMBER,
}: AssertPagePermissionParams) => {
  if (!userId) {
    throw new ReadableError({ code: 'unauthorized' });
  }

  const member = await db
    .select({ role: TeamMembers.role })
    .from(TeamMembers)
    .innerJoin(Teams, eq(TeamMembers.teamId, Teams.id))
    .innerJoin(Sites, eq(Teams.id, Sites.teamId))
    .innerJoin(Pages, eq(Pages.siteId, Sites.id))
    .where(
      and(
        eq(Pages.id, pageId),
        eq(TeamMembers.userId, userId),
        eq(Teams.state, TeamState.ACTIVE),
        eq(Sites.state, SiteState.ACTIVE),
      ),
    )
    .then(first);

  if (!member || teamMemberRolePrecedences.indexOf(member.role) < teamMemberRolePrecedences.indexOf(role)) {
    throw new ReadableError({ code: 'forbidden' });
  }
};
