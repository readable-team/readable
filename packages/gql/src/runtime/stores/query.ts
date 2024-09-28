import { firstValueFrom } from 'rxjs';
import { readable } from 'svelte/store';
import { browser } from '$app/environment';
import { getClient } from '../../client/internal';
import type { Readable } from 'svelte/store';
import type { $StoreSchema, StoreSchema } from '../../types';

type StoreOutput<T extends $StoreSchema<Kind>> =
  | T['$output']
  | (T['$meta'] extends { mode: 'manual' } ? undefined : never);

type RequestContext = Partial<{
  fetch: typeof globalThis.fetch;
}>;

type Kind = 'query';
export type QueryStore<T extends $StoreSchema<Kind>> = Readable<StoreOutput<T>> &
  (T['$input'] extends Record<string, never>
    ? { refetch: (context?: RequestContext) => Promise<T['$output']> }
    : { refetch: (newVariables?: T['$input'], context?: RequestContext) => Promise<T['$output']> });

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
      refetch: async (variablesOrContext?: T['$input'] | RequestContext, context?: RequestContext) => {
        const effectiveVariables = schema.meta.inputless === 'true' ? {} : ((variablesOrContext as T['$input']) ?? {});
        const effectiveContext = schema.meta.inputless === 'true' ? (variablesOrContext as RequestContext) : context;

        const operation = client.createOperation({
          schema,
          variables: effectiveVariables,
          context: {
            fetch: effectiveContext?.fetch,
            requestPolicy: 'network-only',
          },
        });

        const result$ = client.executeOperation(operation);
        const result = await firstValueFrom(result$);

        if (result.type === 'error') {
          throw result.errors[0];
        }

        for (const set of setters) {
          set(result.data);
        }

        return result.data;
      },
    });
  } else {
    return async (
      fetch: typeof globalThis.fetch,
      variables?: T['$input'],
      extensions?: Record<string, unknown>,
    ): Promise<QueryStore<T>> => {
      const operation = client.createOperation({
        schema,
        variables: variables ?? {},
        context: {
          requestPolicy: 'network-only',
          fetch,
          extensions,
        },
      });

      const result$ = client.executeOperation(operation);
      const result = await firstValueFrom(result$);

      if (result.type === 'error') {
        throw result.errors[0];
      }

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

        const result$ = client.executeOperation(operation);

        store = readable<StoreOutput<T>>(result.data, (set) => {
          const subscription = result$.subscribe((result) => {
            if (result.type === 'error') {
              throw result.errors[0];
            }

            set(result.data);
          });

          return () => {
            subscription.unsubscribe();
          };
        });
      } else {
        store = readable<StoreOutput<T>>(result.data);
      }

      return Object.assign(store, {
        refetch: async (newVariablesOrContext?: T['$input'] | RequestContext, context?: RequestContext) => {
          const effectiveVariables =
            schema.meta.inputless === 'true' ? {} : ((newVariablesOrContext as T['$input']) ?? variables ?? {});
          const effectiveContext =
            schema.meta.inputless === 'true' ? (newVariablesOrContext as RequestContext) : context;

          const operation = client.createOperation({
            schema,
            variables: effectiveVariables,
            context: {
              fetch: effectiveContext?.fetch,
              requestPolicy: 'network-only',
            },
          });

          const result$ = client.executeOperation(operation);
          const result = await firstValueFrom(result$);

          if (result.type === 'error') {
            throw result.errors[0];
          }

          return result.data;
        },
      });
    };
  }
};
