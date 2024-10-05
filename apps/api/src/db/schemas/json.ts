export type PlanRules = {
  memberLimit: number | null;
  siteLimit: number | null;
  pageViewLimit: number | null;
  themeColor: boolean;
  customDomain: boolean;
  aiSearch: boolean;
  addonsAvailable: string[];
};

export const defaultPlanRules: PlanRules = {
  memberLimit: 1,
  siteLimit: 1,
  pageViewLimit: 1000,
  themeColor: false,
  customDomain: false,
  aiSearch: false,
  addonsAvailable: [],
};
