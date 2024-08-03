import { persisted } from './svelte/stores/persisted';

export const currentTeamId = persisted<string>('currentTeamId');
