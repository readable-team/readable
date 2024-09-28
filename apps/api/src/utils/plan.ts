import { and, count, eq } from 'drizzle-orm';
import { db, firstOrThrow, Plans, Sites, TeamMembers, Teams } from '@/db';
import { defaultPlanRules } from '@/db/schemas/json';
import { SiteState, TeamState } from '@/enums';
import { ReadableError } from '@/errors';
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
    // .leftJoin(Plans, eq(Teams.planId, Plans.id))
    .where(and(eq(Teams.id, teamId), eq(Teams.state, TeamState.ACTIVE)))
    .then(firstOrThrow);

  return plan.rules?.[rule] ?? defaultPlanRules[rule];
};

export const assertPlanRule = async <T extends keyof PlanRules>(params: GetPlanParams<T>) => {
  const value = await getPlanRule(params);
  if (value === null) {
    return;
  }

  switch (params.rule) {
    case 'aiSearch': {
      if (!value) {
        throw new ReadableError({ code: 'feature_not_available' });
      }
      break;
    }

    case 'siteLimit': {
      const siteCount = await db
        .select({ count: count(Sites.id) })
        .from(Sites)
        .where(and(eq(Sites.teamId, params.teamId), eq(Sites.state, SiteState.ACTIVE)))
        .then((rows) => rows[0]?.count ?? 0);

      if (siteCount >= (value as number)) {
        throw new ReadableError({ code: 'site_limit_exceeded' });
      }
      break;
    }

    case 'memberLimit': {
      const memberCount = await db
        .select({ count: count(TeamMembers.id) })
        .from(TeamMembers)
        .where(eq(TeamMembers.teamId, params.teamId))
        .then((rows) => rows[0]?.count ?? 0);

      if (memberCount >= (value as number)) {
        throw new ReadableError({ code: 'member_limit_exceeded' });
      }
      break;
    }
  }
};
