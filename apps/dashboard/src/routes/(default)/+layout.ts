import { redirect } from '@sveltejs/kit';
import type { DefaultLayout_Query_AfterLoad } from './$graphql';

export const _DefaultLayout_Query_AfterLoad: DefaultLayout_Query_AfterLoad = async (query, event) => {
  if (!query.me) {
    redirect(302, '/auth/login');
  }

  if (query.me.workspaces.length === 0) {
    redirect(302, '/new');
  }

  if (event.route.id == '/(default)') {
    redirect(302, `/workspace/${query.me.workspaces[0].id}`);
  }
};
