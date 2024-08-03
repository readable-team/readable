import { get } from 'svelte/store';
import { currentTeamId } from '$lib/stores';
import type { TeamPage_Query_Variables } from './$graphql';

export const _TeamPage_Query_Variables: TeamPage_Query_Variables = async ({ parent }) => {
  await parent();

  return {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    teamId: get(currentTeamId)!,
  };
};
