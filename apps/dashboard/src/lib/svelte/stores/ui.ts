import { writable } from 'svelte/store';

export const treeOpenState = writable<Record<string, boolean>>({});
export const editingCategoryId = writable<string | null>(null);
export const isPro = writable(false);

export const selectedPlanCycle = writable<'MONTHLY' | 'YEARLY'>('YEARLY');
export const isPlanUpgradeModalOpen = writable(false);
export const isEnrollPlanWithCardModalOpen = writable(false);
