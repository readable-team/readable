import { redirect } from '@sveltejs/kit';
import { ReadableError } from '@/errors';
import { lastTeamIdStore } from '$lib/stores';
import type { TeamLayout_Query_AfterLoad, TeamLayout_Query_OnError, TeamLayout_Query_Variables } from './$graphql';

export const _TeamLayout_Query_Variables: TeamLayout_Query_Variables = async ({ params }) => ({
  teamId: params.teamId,
});

export const _TeamLayout_Query_AfterLoad: TeamLayout_Query_AfterLoad = async (query) => {
  lastTeamIdStore.set(query.team.id);
};

export const _TeamLayout_Query_OnError: TeamLayout_Query_OnError = async (error) => {
  if (error instanceof ReadableError && error.message === 'forbidden') {
    lastTeamIdStore.set(null);
    redirect(302, '/');
  }
};
