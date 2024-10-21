import { builder } from '@/builder';
import { defaultPlanRules } from '@/db/schemas/json';
import { Addon, Plan } from './objects';
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
    themeColor: t.exposeBoolean('themeColor'),
    headerLink: t.exposeBoolean('headerLink'),
    customDomain: t.exposeBoolean('customDomain'),
  }),
});

Plan.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    fee: t.exposeInt('fee'),
    order: t.exposeInt('order'),

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

Addon.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    fee: t.exposeInt('fee'),
  }),
});
