import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { parse, stringify } from 'devalue';
import type { AppRouter } from '@/router';

export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:3000/trpc',
      transformer: {
        serialize: stringify,
        deserialize: parse,
      },
    }),
  ],
});
