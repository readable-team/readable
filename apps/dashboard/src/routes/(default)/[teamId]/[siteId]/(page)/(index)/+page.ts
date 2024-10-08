import { redirect } from '@sveltejs/kit';
import { get } from 'svelte/store';
import { lastPageIdMapStore } from '$lib/stores';
import type { SitePage_Query_AfterLoad, SitePage_Query_Variables } from './$graphql';

export const _SitePage_Query_Variables: SitePage_Query_Variables = ({ params }) => ({
  siteId: params.siteId,
});

export const _SitePage_Query_AfterLoad: SitePage_Query_AfterLoad = async (query) => {
  const lastPageIdMap = get(lastPageIdMapStore);

  if (lastPageIdMap?.[query.site.id]) {
    redirect(302, `/${query.site.team.id}/${query.site.id}/${lastPageIdMap[query.site.id]}`);
  }
};
