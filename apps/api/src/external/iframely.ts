import ky from 'ky';
import { env } from '@/env';

export const unfurl = async (url: string) => {
  const resp = await ky('https://iframe.ly/api/oembed', {
    searchParams: {
      api_key: env.IFRAMELY_API_KEY,
      url,
      omit_script: 1,
    },
  }).then((res) => res.json<Record<string, string>>());

  if (resp.error) {
    throw new Error(resp.error);
  }

  return {
    type: resp.type,
    title: resp.title,
    description: resp.description,
    thumbnailUrl: resp.thumbnail_url,
    html: resp.html,
  };
};
