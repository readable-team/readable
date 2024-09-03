import { filter, from, map, merge, mergeMap, takeUntil } from 'rxjs';
import type { $StoreSchema } from '../types';
import type { Exchange, Operation } from './types';

type GraphQLResponse<T> = {
  data: T | null;
  errors?: unknown[];
};

async function* request<T extends $StoreSchema>(op: Operation<T>) {
  const { schema, variables, context } = op;
  const { name, source } = schema;

  const fetch = context?.fetch ?? globalThis.fetch;

  const response = await fetch(context.url, {
    ...context.fetchOpts,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...context.fetchOpts?.headers,
    },
    body: JSON.stringify({
      operationName: name,
      query: source,
      variables,
    }),
  });

  const body = await response.json();

  yield body as GraphQLResponse<T['$output']>;
}

export const fetchExchange: Exchange = ({ forward }) => {
  return (ops$) => {
    const fetch$ = ops$.pipe(
      filter((operation) => operation.type === 'query' || operation.type === 'mutation'),
      mergeMap((operation) => {
        const teardown$ = ops$.pipe(filter((op) => op.type === 'teardown' && op.key === operation.key));

        return from(request(operation)).pipe(
          map((resp) => ({
            operation,
            data: resp.data,
            errors: resp.errors,
          })),
          takeUntil(teardown$),
        );
      }),
    );

    const forward$ = ops$.pipe(
      filter((op) => op.type !== 'query' && op.type !== 'mutation'),
      forward,
    );

    return merge(fetch$, forward$);
  };
};
