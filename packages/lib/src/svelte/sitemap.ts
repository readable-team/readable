import { create } from 'xmlbuilder2';
import type { RequestEvent } from '@sveltejs/kit';

export const sitemap = (event: RequestEvent, paths: string[]) => {
  const doc = create({
    urlset: {
      '@xmlns': 'http://www.sitemaps.org/schemas/sitemap/0.9',
      url: paths.map((path) => ({ loc: `${event.url.origin}${path}` })),
    },
  });

  return new Response(doc.end(), {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
};
