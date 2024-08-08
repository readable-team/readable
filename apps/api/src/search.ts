import { MeiliSearch } from 'meilisearch';
import { env } from '@/env';

export const ms = new MeiliSearch({
  host: env.MEILISEARCH_URL,
  apiKey: env.MEILISEARCH_API_KEY,
});
