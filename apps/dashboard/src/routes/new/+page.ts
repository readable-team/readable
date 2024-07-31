import { redirect } from '@sveltejs/kit';
import type { NewPage_Query_AfterLoad } from './$graphql';

export const _NewPage_Query_AfterLoad: NewPage_Query_AfterLoad = async (query) => {
  if (!query.me) {
    redirect(302, '/auth/login');
  }

  if (query.me.workspaces.length > 0) {
    redirect(302, '/');
  }
};
