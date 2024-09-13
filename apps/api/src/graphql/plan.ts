import { and, eq } from 'drizzle-orm';
import { builder } from '@/builder';
import { db, firstOrThrow, Plans, Teams } from '@/db';
import { defaultPlanRules } from '@/db/schemas/json';
import { PlanAvailability, TeamMemberRole } from '@/enums';
import { assertTeamPermission } from '@/utils/permissions';
import { Plan, Team } from './objects';

/**
 * * Types
 */

const PlanRule = builder.simpleObject('PlanRule', {
  fields: (t) => ({
    memberLimit: t.int({ nullable: true }),
    siteLimit: t.int({ nullable: true }),
    pageViewLimit: t.int({ nullable: true }),
    auditLog: t.boolean(),
    statistics: t.boolean(),
    aiSearch: t.boolean(),
  }),
});

Plan.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    rules: t.field({
      type: PlanRule,
      resolve: (plan) => {
        return {
          ...defaultPlanRules,
          ...plan.rules,
        };
      },
    }),
  }),
});

Team.implement({
  fields: (t) => ({
    plan: t.field({ type: Plan, resolve: (team) => team.planId }),
  }),
});

builder.mutationFields((t) => ({
  updatePlan: t.withAuth({ session: true }).fieldWithInput({
    type: Team,
    input: {
      teamId: t.input.string(),
      planId: t.input.string(),
    },
    resolve: async (_, { input }, ctx) => {
      await assertTeamPermission({
        teamId: input.teamId,
        userId: ctx.session.userId,
        role: TeamMemberRole.ADMIN,
      });

      await db
        .select()
        .from(Plans)
        .where(and(eq(Plans.id, input.planId), eq(Plans.availability, PlanAvailability.PUBLIC)))
        .then(firstOrThrow);

      return await db
        .update(Teams)
        .set({ planId: input.planId })
        .where(eq(Teams.id, input.teamId))
        .returning()
        .then(firstOrThrow);
    },
  }),
}));
