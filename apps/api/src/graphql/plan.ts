import { builder } from '@/builder';
import { defaultPlanRules } from '@/db/schemas/json';
import { Plan } from './objects';

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
