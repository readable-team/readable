import { redirect } from '@sveltejs/kit';
import type { DefaultLayout_Query_AfterLoad } from './$graphql';

export const _DefaultLayout_Query_AfterLoad: DefaultLayout_Query_AfterLoad = async (query) => {
  if (!query.me) {
    redirect(302, '/auth/login');
  }
};
