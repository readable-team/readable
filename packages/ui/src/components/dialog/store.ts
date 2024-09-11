import { writable } from 'svelte/store';

// 열린 dialog의 목록을 저장
export const dialogStore = writable<HTMLElement[]>([]);
