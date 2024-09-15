import { redirect } from '@sveltejs/kit';
import { get } from 'svelte/store';
import { lastTeamIdStore } from '$lib/stores';
import type { IndexPage_Query_AfterLoad } from './$graphql';

export const _IndexPage_Query_AfterLoad: IndexPage_Query_AfterLoad = async (query) => {
  if (!query.me) {
    redirect(302, '/auth/login');
  }

  if (query.me.teams.length === 0) {
    redirect(302, '/new');
  }

  const lastTeamId = get(lastTeamIdStore);
  if (lastTeamId && query.me.teams.some((team) => team.id === lastTeamId)) {
    redirect(302, `/${lastTeamId}`);
  }

  redirect(302, `/${query.me.teams[0].id}`);
};
