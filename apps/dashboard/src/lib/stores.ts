import { persisted } from './svelte/stores/persisted';

export const lastTeamIdStore = persisted<string>('lastTeamId');
export const lastPageIdMapStore = persisted<Record<string, string>>('lastPageIdMap');
