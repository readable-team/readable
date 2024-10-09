import { writable } from 'svelte/store';

export const mobileNavOpen = writable(false);
export const treeOpenState = writable<Record<string, boolean>>({});
export const searchBarOpen = writable(false);
export const hasCmd = writable(false);
