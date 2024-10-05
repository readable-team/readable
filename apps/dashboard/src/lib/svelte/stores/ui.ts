import { writable } from 'svelte/store';
import { LitePlan } from '$assets/plan';

export const treeOpenState = writable<Record<string, boolean>>({});
export const editingCategoryId = writable<string | null>(null);
export const isLiteOrHigher = writable<boolean>(false);
export const isPro = writable<boolean>(false);

export const selectedPlanCycle = writable<'MONTHLY' | 'YEARLY'>('YEARLY');
export const selectedPlan = writable<{
  id: string;
  name: string;
  price: number;
}>(LitePlan);
export const isPlanUpgradeModalOpen = writable(false);
export const isEnrollPlanWithCardModalOpen = writable(false);
