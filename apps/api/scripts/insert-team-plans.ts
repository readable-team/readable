import { eq, isNull } from 'drizzle-orm';
import { db, TeamPlans, Teams } from '@/db';
import { BillingCycle } from '@/enums';

const teams = await db
  .select({ id: Teams.id })
  .from(Teams)
  .leftJoin(TeamPlans, eq(TeamPlans.teamId, Teams.id))
  .where(isNull(TeamPlans.id));

await db.transaction(async (tx) => {
  for (const team of teams) {
    await tx.insert(TeamPlans).values({
      teamId: team.id,
      planId: 'PLAN000000BASIC',
      billingCycle: BillingCycle.MONTHLY,
    });
  }
});
