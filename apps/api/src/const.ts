export type PlanId = keyof typeof PlanId;
export const PlanId = {
  STARTER: 'PLAN0STARTER',
  LITE: 'PLAN0LITE',
  PRO: 'PLAN0PRO',
} as const;

export type AddonId = keyof typeof AddonId;
export const AddonId = {
  WHITELABEL: 'ADD0WHITELABEL',
} as const;
