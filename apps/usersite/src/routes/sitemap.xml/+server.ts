import { sitemap } from '@readable/lib/svelte';
import { pageUrl } from '$lib/utils/url';
import { sitemapQuery } from './query.svelte';

export const GET = async (event) => {
  const query = await sitemapQuery.refetch();

  const pages = ['/'];
  for (const page of query.publicSite.pages) {
    pages.push(pageUrl(page));
  }

  return sitemap(event, pages);
};
