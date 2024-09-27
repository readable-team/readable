import { error, redirect } from '@sveltejs/kit';
import { pageUrl } from '$lib/utils/url';
import type { IndexPage_Query_AfterLoad } from './$graphql';

export const _IndexPage_Query_AfterLoad: IndexPage_Query_AfterLoad = async (query, { url }) => {
  if (query.publicSite.firstPage) {
    redirect(302, pageUrl(query.publicSite.firstPage) + url.search);
  }

  error(404);
};
