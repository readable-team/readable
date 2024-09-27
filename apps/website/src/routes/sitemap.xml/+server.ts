import { sitemap } from '@readable/lib/svelte';

export const GET = async (event) => {
  return sitemap(event, ['/', '/pricing', '/preview', '/contact']);
};
