import { redirect } from '@sveltejs/kit';
import { get } from 'svelte/store';
import { ReadableError } from '@/errors';
import { currentTeamId } from '$lib/stores';
import type { TeamPage_Query_OnError, TeamPage_Query_Variables } from './$graphql';

export const _TeamPage_Query_Variables: TeamPage_Query_Variables = async ({ parent }) => {
  await parent();

  return {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    teamId: get(currentTeamId)!,
  };
};

export const _TeamPage_Query_OnError: TeamPage_Query_OnError = async (error) => {
  if (error instanceof ReadableError && error.message === 'forbidden') {
    currentTeamId.set(null);
    redirect(302, '/new');
  }
};
