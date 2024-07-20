import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { parse, stringify } from 'devalue';
import { get } from 'svelte/store';
import { env } from '$env/dynamic/public';
import { persisted } from '$lib/svelte/stores/persisted';
import type { AppRouter } from '@/router';

export const accessToken = persisted<string>('at');

export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${env.PUBLIC_API_URL}/trpc`,
      transformer: {
        serialize: stringify,
        deserialize: parse,
      },
      fetch: (input, init) => {
        const token = get(accessToken);

        return fetch(input, {
          ...init,
          credentials: 'include',
          headers: {
            ...init?.headers,
            ...(token && { authorization: `Bearer ${token}` }),
          },
        });
      },
    }),
  ],
});
