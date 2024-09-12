import { writable } from 'svelte/store';

export const treeOpenState = writable<Record<string, boolean>>({});
