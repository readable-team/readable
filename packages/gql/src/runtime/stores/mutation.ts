import { firstValueFrom, map } from 'rxjs';
import { readable } from 'svelte/store';
import { getClient } from '../../client/internal';
import type { Readable } from 'svelte/store';
import type { $StoreSchema, StoreSchema } from '../../types';

type Kind = 'mutation';
export type MutationStore<T extends $StoreSchema<Kind>> = Readable<{ inflight: boolean }> &
  (T['$input'] extends Record<string, never>
    ? () => Promise<T['$output'][keyof T['$output']]>
    : (input: T['$input'] extends { input: infer U } ? U : never) => Promise<T['$output'][keyof T['$output']]>);

export const createMutationStore = <T extends $StoreSchema<Kind>>(schema: StoreSchema<T>): MutationStore<T> => {
  const { client } = getClient();
  const store = readable<{ inflight: boolean }>({ inflight: false });

  const mutate = async (input?: T['$input'] extends { input: infer U } ? U : never) => {
    const operation = client.createOperation({
      schema,
      variables: input ? { input } : {},
      context: {
        requestPolicy: 'network-only',
      },
    });

    const result$ = client.executeOperation(operation).pipe(map((result) => result.data as T['$output']));
    const data = await firstValueFrom(result$);

    return data[Object.keys(data as never)[0] as keyof typeof data] as T['$output'][keyof T['$output']];
  };

  return Object.assign(mutate, store);
};
