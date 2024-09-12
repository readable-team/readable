export type PlanRules = {
  memberLimit: number | null;
  siteLimit: number | null;
  pageViewLimit: number | null;
  auditLog: boolean;
  statistics: boolean;
  aiSearch: boolean;
};

export const defaultPlanRules: PlanRules = {
  memberLimit: 1,
  siteLimit: 1,
  pageViewLimit: 5000,
  auditLog: false,
  statistics: false,
  aiSearch: false,
};
