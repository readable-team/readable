import { and, asc, eq, isNull } from 'drizzle-orm';
import { db, first, TeamMembers, TeamPlans, Teams, Users } from '@/db';
import { BillingCycle, TeamMemberRole } from '@/enums';

const teams = await db
  .select({ id: Teams.id })
  .from(Teams)
  .leftJoin(TeamPlans, eq(TeamPlans.teamId, Teams.id))
  .where(isNull(TeamPlans.id));

await db.transaction(async (tx) => {
  for (const team of teams) {
    const user = await tx
      .select({ email: Users.email })
      .from(TeamMembers)
      .innerJoin(Users, eq(TeamMembers.userId, Users.id))
      .where(and(eq(TeamMembers.teamId, team.id), eq(TeamMembers.role, TeamMemberRole.ADMIN)))
      .orderBy(asc(TeamMembers.createdAt))
      .then(first);

    await tx.insert(TeamPlans).values({
      teamId: team.id,
      planId: 'PLAN000000BASIC',
      billingCycle: BillingCycle.MONTHLY,
      billingEmail: user?.email ?? 'user@example.com',
    });
  }
});
