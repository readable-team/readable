import { builder } from '@/builder';
import { defaultPlanRules } from '@/db/schemas/json';
import { Plan } from './objects';
import type { PlanRules } from '@/db/schemas/json';

/**
 * * Types
 */

const PlanRule = builder.objectRef<PlanRules>('PlanRule');
PlanRule.implement({
  fields: (t) => ({
    memberLimit: t.exposeInt('memberLimit', { nullable: true }),
    siteLimit: t.exposeInt('siteLimit', { nullable: true }),
    pageViewLimit: t.exposeInt('pageViewLimit', { nullable: true }),
    aiSearch: t.exposeBoolean('aiSearch'),
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
