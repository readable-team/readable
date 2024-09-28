export type PlanRules = {
  memberLimit: number | null;
  siteLimit: number | null;
  pageViewLimit: number | null;
  aiSearch: boolean;
};

export const defaultPlanRules: PlanRules = {
  memberLimit: 1,
  siteLimit: 1,
  pageViewLimit: 5000,
  aiSearch: false,
};
