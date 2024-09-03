import { map } from 'rxjs';
import { getClient } from '../../client/internal';
import type { $StoreSchema, StoreSchema } from '../../types';

type Kind = 'subscription';
export type SubscriptionStore<T extends $StoreSchema<Kind>> = {
  subscribe: T['$input'] extends Record<string, never> ? () => () => void : (variables: T['$input']) => () => void;
  on: (event: 'data', handler: (data: T['$output']) => void) => void;
};

export const createSubscriptionStore = <T extends $StoreSchema<Kind>>(schema: StoreSchema<T>): SubscriptionStore<T> => {
  const { client } = getClient();
  const handlers = new Set<(data: T['$output']) => void>();

  const subscribe = (variables?: T['$input']) => {
    const operation = client.createOperation({
      schema,
      variables: variables ?? {},
      context: {
        requestPolicy: 'network-only',
      },
    });

    const observable = client.executeOperation(operation).pipe(map((result) => result.data as T['$output']));

    const subscription = observable.subscribe({
      next: (data) => {
        for (const handler of handlers) handler(data);
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  };

  const on = (event: 'data', handler: (data: T['$output']) => void) => {
    if (event === 'data') handlers.add(handler);
  };

  return { subscribe, on };
};
