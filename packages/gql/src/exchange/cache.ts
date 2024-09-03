import { filter, map, merge, mergeMap, share, tap } from 'rxjs';
import { Cache } from '../cache/cache';
import type { Exchange } from './types';

export const cacheExchange: Exchange = ({ forward }) => {
  const cache = new Cache();

  return (ops$) => {
    const cache$ = ops$.pipe(
      filter((operation) => operation.type === 'query' && operation.context.requestPolicy !== 'network-only'),
      mergeMap((operation) =>
        cache.observe(operation.schema, operation.variables).pipe(map((v) => ({ operation, ...v }))),
      ),
      share(),
    );

    const nonCache$ = ops$.pipe(
      filter((operation) => operation.type !== 'query' || operation.context.requestPolicy === 'network-only'),
    );

    const cacheHit$ = cache$.pipe(filter((data) => !data.partial));
    const cacheMiss$ = cache$.pipe(
      filter((data) => data.partial),
      map((data) => data.operation),
    );

    const forward$ = merge(nonCache$, cacheMiss$).pipe(
      forward,
      tap((result) => {
        if (result.data) {
          cache.write(result.operation.schema, result.operation.variables, result.data);
        }
      }),
    );

    return merge(cacheHit$, forward$);
  };
};
