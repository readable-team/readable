import { createTRPCClient, httpBatchLink, splitLink, unstable_httpSubscriptionLink } from '@trpc/client';
import { parse, stringify } from 'devalue';
import { EventSourcePolyfill } from 'event-source-polyfill';
import { get } from 'svelte/store';
import { env } from '$env/dynamic/public';
import { persisted } from '$lib/svelte/stores/persisted';
import type { AppRouter } from '@/router';

// @ts-expect-error - monkey patch
globalThis.EventSource = EventSourcePolyfill;

export const accessToken = persisted<string>('at');

export const trpc = createTRPCClient<AppRouter>({
  links: [
    splitLink({
      condition: (op) => op.type === 'subscription',
      true: unstable_httpSubscriptionLink({
        url: `${env.PUBLIC_API_URL}/trpc`,
        transformer: {
          serialize: stringify,
          deserialize: parse,
        },
        eventSourceOptions: () => {
          const token = get(accessToken);

          return {
            headers: {
              ...(token && { authorization: `Bearer ${token}` }),
            },
          } as EventSourceInit;
        },
      }),
      false: httpBatchLink({
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
    }),
  ],
});
