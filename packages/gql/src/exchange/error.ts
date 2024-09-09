import { filter, map, merge, share } from 'rxjs';
import type { GraphQLError } from 'graphql';
import type { Exchange } from './types';

export const errorExchange =
  (transform: (error: GraphQLError) => GraphQLError): Exchange =>
  ({ forward }) => {
    return (ops$) => {
      const forward$ = ops$.pipe(forward, share());

      const error$ = forward$.pipe(
        filter((result) => result.type === 'error'),
        map((result) => ({
          type: 'error' as const,
          operation: result.operation,
          errors: result.errors.map((error) => transform(error)),
        })),
      );

      const data$ = forward$.pipe(filter((result) => result.type === 'data'));

      return merge(error$, data$);
    };
  };
