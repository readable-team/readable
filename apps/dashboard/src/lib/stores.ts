import { persisted } from './svelte/stores/persisted';

export const currentTeamId = persisted<string>('currentTeamId');
export const lastVisitedPage = persisted<string>('lastVisitedPage');
