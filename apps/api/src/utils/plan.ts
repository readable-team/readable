import { and, eq } from 'drizzle-orm';
import { db, firstOrThrow, Plans, Teams } from '@/db';
import { defaultPlanRules } from '@/db/schemas/json';
import { TeamState } from '@/enums';
import type { PlanRules } from '@/db/schemas/json';

type GetPlanParams<T extends keyof PlanRules> = {
  teamId: string;
  rule: T;
};

export const getPlanRule = async <T extends keyof PlanRules>({
  teamId,
  rule,
}: GetPlanParams<T>): Promise<PlanRules[T]> => {
  const plan = await db
    .select({ rules: Plans.rules })
    .from(Teams)
    .leftJoin(Plans, eq(Teams.planId, Plans.id))
    .where(and(eq(Teams.id, teamId), eq(Teams.state, TeamState.ACTIVE)))
    .then(firstOrThrow);

  return plan.rules?.[rule] ?? defaultPlanRules[rule];
};
