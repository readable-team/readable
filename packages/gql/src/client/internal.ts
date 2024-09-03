// @ts-expect-error internal import
import factory from '$graphql/client';
import type { GqlClient } from './index';

const client = factory();
export const getClient = (): GqlClient => {
  if (typeof window === 'undefined') {
    return factory();
  }

  return client;
};
