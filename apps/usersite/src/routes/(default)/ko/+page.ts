import { error, redirect } from '@sveltejs/kit';
import type { KoIndexPage_Query_AfterLoad } from './$graphql';

export const _KoIndexPage_Query_AfterLoad: KoIndexPage_Query_AfterLoad = async (query) => {
  if (query.publicSite.firstPage) {
    redirect(302, `/ko/${query.publicSite.firstPage.slug}`);
  }

  error(404);
};
