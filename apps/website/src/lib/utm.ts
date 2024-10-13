import qs from 'query-string';
import { get } from 'svelte/store';
import { browser } from '$app/environment';
import { page } from '$app/stores';

const getUtm = () => {
  const { url } = get(page);
  return Object.fromEntries([...url.searchParams.entries()].filter(([key]) => key.startsWith('utm_')));
};

export const persistUtm = () => {
  const utm = getUtm();
  if (Object.keys(utm).length > 0) {
    localStorage.setItem('utm', JSON.stringify(utm));
  }
};

export const withUtm = (url: string, query?: Record<string, string>) => {
  let utm = getUtm();
  if (Object.keys(utm).length === 0 && browser) {
    utm = JSON.parse(localStorage.getItem('utm') ?? '{}');
  }

  if (Object.keys(utm).length > 0) {
    return qs.stringifyUrl({
      url,
      query: {
        ...utm,
        ...query,
      },
    });
  }

  return url;
};
