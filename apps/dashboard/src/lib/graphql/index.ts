import { createClient, errorExchange } from '@readable/gql';
import { get } from 'svelte/store';
import { ReadableError } from '@/errors';
import { env } from '$env/dynamic/public';
import { persisted } from '$lib/svelte/stores/persisted';

export const accessToken = persisted<string | null>('at');

// eslint-disable-next-line import/no-default-export
export default createClient({
  url: `${env.PUBLIC_API_URL}/graphql`,
  headers: () => {
    const token = get(accessToken);

    return {
      'x-rdbl-svc': 'dashboard',
      ...(token ? { Authorization: `Bearer ${token}` } : undefined),
    };
  },
  exchanges: [
    errorExchange((error) => {
      if (error.extensions.type === 'ReadableError') {
        return new ReadableError({
          code: error.extensions.code as string,
          message: error.message,
        });
      }

      return error;
    }),
  ],
});
