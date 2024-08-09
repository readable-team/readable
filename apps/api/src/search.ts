import { MeiliSearch } from 'meilisearch';
import { env, production } from '@/env';

export const ms = new MeiliSearch({
  host: env.MEILISEARCH_URL,
  apiKey: env.MEILISEARCH_API_KEY,
});

export const searchIndexName = (name: string) => {
  return production ? name : `${name}_dev`;
};

export const searchIndex = (name: string) => {
  return ms.index(searchIndexName(name));
};
