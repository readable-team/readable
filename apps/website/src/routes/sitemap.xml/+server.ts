import { sitemap } from '@readable/lib';

export const GET = async (event) => {
  return sitemap(event, ['/']);
};
