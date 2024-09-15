import { redirect } from '@sveltejs/kit';
import { ReadableError } from '@/errors';
import { lastPageIdMapStore } from '$lib/stores';
import type { PagePage_Query_AfterLoad, PagePage_Query_OnError, PagePage_Query_Variables } from './$graphql';

export const _PagePage_Query_Variables: PagePage_Query_Variables = ({ params }) => ({
  siteId: params.siteId,
  pageId: params.pageId,
});

export const _PagePage_Query_AfterLoad: PagePage_Query_AfterLoad = async (query) => {
  lastPageIdMapStore.update((map) => ({ ...map, [query.page.site.id]: query.page.id }));
};

export const _PagePage_Query_OnError: PagePage_Query_OnError = async (error, event) => {
  if (error instanceof ReadableError && error.code === 'forbidden') {
    redirect(302, `/${event.params.teamId}/${event.params.siteId}`);
  }
};
