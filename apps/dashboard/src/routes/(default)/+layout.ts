import { redirect } from '@sveltejs/kit';
import { get } from 'svelte/store';
import { currentTeamId } from '$lib/stores';
import type { DefaultLayout_Query_AfterLoad } from './$graphql';

export const _DefaultLayout_Query_AfterLoad: DefaultLayout_Query_AfterLoad = async (query) => {
  if (!query.me) {
    redirect(302, '/auth/login');
  }

  if (query.me.teams.length === 0) {
    redirect(302, '/new');
  }

  const teamId = get(currentTeamId);
  const hasTeam = query.me.teams.some((team) => team.id === teamId);

  console.log({ teamId, hasTeam });

  if (teamId && !hasTeam) {
    if (query.me.teams.length > 0) {
      currentTeamId.set(query.me.teams[0].id);
    } else {
      currentTeamId.set(null);
      redirect(302, '/new');
    }
  }

  if (!teamId) {
    currentTeamId.set(query.me.teams[0].id);
  }
};
