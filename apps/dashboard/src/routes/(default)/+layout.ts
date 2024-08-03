import { redirect } from '@sveltejs/kit';
import type { DefaultLayout_Query_AfterLoad } from './$graphql';

export const _DefaultLayout_Query_AfterLoad: DefaultLayout_Query_AfterLoad = async (query, event) => {
  if (!query.me) {
    redirect(302, '/auth/login');
  }

  if (query.me.teams.length === 0) {
    redirect(302, '/new');
  }

  if (event.route.id == '/(default)') {
    redirect(302, `/team/${query.me.teams[0].id}`);
  }
};
