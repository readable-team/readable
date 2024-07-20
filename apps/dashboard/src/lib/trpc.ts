import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { parse, stringify } from 'devalue';
import { env } from '$env/dynamic/public';
import type { LoadEvent } from '@sveltejs/kit';
import type { AppRouter } from '@/router';

export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${env.PUBLIC_API_URL}/trpc`,
      transformer: {
        serialize: stringify,
        deserialize: parse,
      },
      fetch: (input, init) => {
        return fetch(input, {
          ...init,
          credentials: 'include',
        });
      },
    }),
  ],
});

export const trpcS = (event: LoadEvent) => {
  return createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: `${env.PUBLIC_API_URL}/trpc`,
        transformer: {
          serialize: stringify,
          deserialize: parse,
        },
        fetch: (input, init) => {
          return event.fetch(input, {
            ...init,
            credentials: 'include',
            headers: {
              ...init?.headers,
              'x-use-credentials': '1',
            },
          });
        },
      }),
    ],
  });
};
