import { redirect } from '@sveltejs/kit';
import { pageUrl } from '$lib/utils/url';
import type { PagePage_Query_AfterLoad, PagePage_Query_Variables } from './$graphql';

export const _PagePage_Query_Variables: PagePage_Query_Variables = async ({ params }) => {
  return { slug: params.slug.split('-', 2)[0] };
};

export const _PagePage_Query_AfterLoad: PagePage_Query_AfterLoad = (query, event) => {
  const expectedUrl = pageUrl(query.publicPage);
  const actualUrl = event.url.pathname;

  if (expectedUrl !== actualUrl) {
    redirect(302, expectedUrl);
  }
};
