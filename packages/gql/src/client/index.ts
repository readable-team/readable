import { Client, subscriptionExchange } from '@urql/core';
import { cacheExchange } from '@urql/exchange-graphcache';
import { createClient as createSSEClient } from 'graphql-sse';
import { fetchExchange } from './exchanges/fetch';
import type { Exchange } from '@urql/core';
import type { CacheExchangeOpts } from '@urql/exchange-graphcache';
import type { RequestParams } from 'graphql-sse';

export type GqlClient<E = Error> = {
  client: Client;
  transformError: (error: unknown) => E;
  onMutationError: (error: E) => void;
};

type CreateClientParams<E> = {
  url: string;
  headers?: () => Record<string, string>;
  cache: CacheExchangeOpts;
  transformError: (error: unknown) => E;
  onMutationError: (error: E) => void;
};

export const createClient = <E>({ url, cache, headers, ...rest }: CreateClientParams<E>) => {
  return (): GqlClient<E> => {
    const sseClient = createSSEClient({
      url,
      headers,
      retry: () => new Promise((resolve) => setTimeout(resolve, 500)),
      retryAttempts: Number.POSITIVE_INFINITY,
    });

    const exchanges: Exchange[] = [];

    exchanges.push(
      cacheExchange(cache),
      fetchExchange,
      subscriptionExchange({
        forwardSubscription: (operation) => {
          return {
            subscribe: (sink) => {
              const unsubscribe = sseClient.subscribe(operation as RequestParams, sink);
              return { unsubscribe };
            },
          };
        },
      }),
    );

    return {
      client: new Client({
        url,
        exchanges,
        fetchOptions: () => ({ headers: headers?.() }),
      }),
      ...rest,
    };
  };
};
