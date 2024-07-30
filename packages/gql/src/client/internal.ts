import { browser } from '$app/environment';
import factory from '$gql/client';
import type { GqlClient } from '.';

let client: GqlClient | undefined;
export const getClient = (): GqlClient => {
  if (!browser) {
    return factory();
  }

  client ??= factory();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return client!;
};
