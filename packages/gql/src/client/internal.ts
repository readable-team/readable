// @ts-expect-error internal import
import factory from '$graphql/client';
import type { GqlClient } from './index';

let client: GqlClient | undefined;
export const getClient = (): GqlClient => {
  if (typeof window === 'undefined') {
    return factory();
  }

  client ??= factory();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return client!;
};
