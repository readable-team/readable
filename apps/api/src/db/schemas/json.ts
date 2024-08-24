export type PlanRules = {
  memberLimit: number;
  siteLimit: number;
  pageViewLimit: number;
  auditLog: boolean;
  statistics: boolean;
};

export const defaultPlanRules: PlanRules = {
  memberLimit: 1,
  siteLimit: 1,
  pageViewLimit: 5000,
  auditLog: false,
  statistics: false,
};
