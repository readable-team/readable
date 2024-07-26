import { error } from '@sveltejs/kit';
import { trpcS } from '$lib/trpc';

export const load = async (event) => {
  let host = event.url.hostname;
  if (process.env.NODE_ENV !== 'production') {
    const hostOverride = event.cookies.get('RDBL_HOST_OVERRIDE');
    if (hostOverride) {
      host = hostOverride;
    }
  }

  const site = await trpcS(event).public.site.query({ host });
  if (!site) {
    error(404, { code: 'site_not_found', message: 'Site not found' });
  }

  return {
    site,
  };
};
