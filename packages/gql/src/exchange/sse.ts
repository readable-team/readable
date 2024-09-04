import { createClient } from 'graphql-sse';
import { filter, map, merge, mergeMap, Subject, takeUntil, tap } from 'rxjs';
import type { ExecutionResult } from 'graphql-sse';
import type { Exchange } from './types';

export const sseExchange = (url: string, headers?: () => Record<string, string>): Exchange => {
  const sse = createClient({
    url,
    headers,
    credentials: 'include',
    retry: () => new Promise((resolve) => setTimeout(resolve, 500)),
    retryAttempts: Number.POSITIVE_INFINITY,
  });

  return ({ forward }) => {
    return (ops$) => {
      const sse$ = ops$.pipe(
        filter((operation) => operation.type === 'subscription'),
        mergeMap((operation) => {
          const { schema, variables } = operation;
          const { name, source } = schema;

          const subject = new Subject<ExecutionResult>();
          const unsubscribe = sse.subscribe({ operationName: name, query: source, variables }, subject);

          const teardown$ = ops$.pipe(
            filter((op) => op.type === 'teardown' && op.key === operation.key),
            tap(() => unsubscribe()),
          );

          return subject.pipe(
            map((result) => {
              if (result.errors?.length) {
                return {
                  type: 'error' as const,
                  operation,
                  errors: result.errors,
                };
              } else {
                return {
                  type: 'data' as const,
                  operation,
                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  data: result.data!,
                };
              }
            }),
            takeUntil(teardown$),
          );
        }),
      );

      const forward$ = ops$.pipe(
        filter((op) => op.type !== 'subscription'),
        forward,
      );

      return merge(sse$, forward$);
    };
  };
};
