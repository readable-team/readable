import { writable } from 'svelte/store';

export const mobileNavOpen = writable(false);
export const treeOpenState = writable<Record<string, boolean>>({});
