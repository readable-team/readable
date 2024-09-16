import { filter, map, merge, mergeMap, share, takeUntil, tap } from 'rxjs';
import { Cache } from '../cache/cache';
import type { Exchange } from './types';

export const cacheExchange =
  (cache: Cache): Exchange =>
  ({ forward }) => {
    return (ops$) => {
      const cache$ = ops$.pipe(
        filter((operation) => operation.type === 'query' && operation.context.requestPolicy !== 'network-only'),
        mergeMap((operation) => {
          const teardown$ = ops$.pipe(filter((op) => op.type === 'teardown' && op.key === operation.key));

          return cache.observe(operation.schema, operation.variables).pipe(
            map((v) => ({ operation, ...v })),
            takeUntil(teardown$),
          );
        }),
        share(),
      );

      const nonCache$ = ops$.pipe(
        filter((operation) => operation.type !== 'query' || operation.context.requestPolicy === 'network-only'),
      );

      const cacheHit$ = cache$.pipe(
        filter((data) => !data.partial),
        map((data) => ({
          type: 'data' as const,
          operation: data.operation,
          data: data.data,
        })),
      );

      const cacheMiss$ = cache$.pipe(
        filter((data) => data.partial),
        map((data) => data.operation),
      );

      const forward$ = merge(nonCache$, cacheMiss$).pipe(
        forward,
        tap((result) => {
          if (result.type === 'data') {
            cache.write(result.operation.schema, result.operation.variables, result.data);
          }
        }),
      );

      return merge(cacheHit$, forward$);
    };
  };
