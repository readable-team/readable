import { firstValueFrom, map } from 'rxjs';
import { readable } from 'svelte/store';
import { browser } from '$app/environment';
import { getClient } from '../../client/internal';
import type { Readable } from 'svelte/store';
import type { $StoreSchema, StoreSchema } from '../../types';

type StoreOutput<T extends $StoreSchema<Kind>> =
  | T['$output']
  | (T['$meta'] extends { mode: 'manual' } ? undefined : never);

type Kind = 'query';
export type QueryStore<T extends $StoreSchema<Kind>> = Readable<StoreOutput<T>> &
  (T['$input'] extends Record<string, never>
    ? { refetch: () => Promise<T['$output']> }
    : { refetch: (newVariables?: T['$input']) => Promise<T['$output']> });

export const createQueryStore = <T extends $StoreSchema<Kind>>(schema: StoreSchema<T>) => {
  const { client } = getClient();

  if (schema.meta.mode === 'manual') {
    const setters = new Set<(v: T['$output']) => void>();

    const store = readable<StoreOutput<T>>(undefined, (set) => {
      setters.add(set);
      return () => {
        setters.delete(set);
      };
    });

    return Object.assign(store, {
      refetch: async (variables?: T['$input']) => {
        const operation = client.createOperation({
          schema,
          variables: variables ?? {},
          context: {
            requestPolicy: 'network-only',
          },
        });

        const result$ = client.executeOperation(operation).pipe(map((result) => result.data as T['$output']));
        const data = await firstValueFrom(result$);

        for (const set of setters) {
          set(data);
        }

        return data;
      },
    });
  } else {
    return async (fetch: typeof globalThis.fetch, variables?: T['$input']): Promise<QueryStore<T>> => {
      const operation = client.createOperation({
        schema,
        variables: variables ?? {},
        context: {
          requestPolicy: 'network-only',
          fetch,
        },
      });

      const result$ = client.executeOperation(operation).pipe(map((result) => result.data as T['$output']));
      const data = await firstValueFrom(result$);

      let store;
      if (browser) {
        const operation = client.createOperation({
          schema,
          variables: variables ?? {},
          context: {
            requestPolicy: 'cache-only',
            fetch,
          },
        });

        const result$ = client.executeOperation(operation).pipe(map((result) => result.data as T['$output']));

        store = readable<StoreOutput<T>>(data, (set) => {
          const subscription = result$.subscribe((data) => {
            set(data);
          });

          return () => {
            subscription.unsubscribe();
          };
        });
      } else {
        store = readable<StoreOutput<T>>(data);
      }

      return Object.assign(store, {
        refetch: async (newVariables?: T['$input']) => {
          const operation = client.createOperation({
            schema,
            variables: newVariables ?? variables ?? {},
          });

          const result$ = client.executeOperation(operation).pipe(map((result) => result.data as T['$output']));
          const data = await firstValueFrom(result$);

          return data;
        },
      });
    };
  }
};
