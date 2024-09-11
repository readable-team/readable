import { redirect } from '@sveltejs/kit';
import { get } from 'svelte/store';
import { ReadableError } from '@/errors';
import { lastVisitedPage } from '$lib/stores';
import type { SitePage_Query_AfterLoad, SitePage_Query_OnError, SitePage_Query_Variables } from './$graphql';

export const _SitePage_Query_Variables: SitePage_Query_Variables = ({ params }) => ({
  siteId: params.siteId,
});

export const _SitePage_Query_AfterLoad: SitePage_Query_AfterLoad = async (query) => {
  const visitedPage = get(lastVisitedPage);

  if (visitedPage) {
    redirect(302, `/${query.site.id}/${visitedPage}`);
  }
};

export const _SitePage_Query_OnError: SitePage_Query_OnError = async (error) => {
  if (error instanceof ReadableError && error.message === 'forbidden') {
    redirect(302, `/`);
  }
};
