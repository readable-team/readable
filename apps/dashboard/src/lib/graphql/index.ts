import { createClient } from '@readable/gql';
import { get } from 'svelte/store';
import { env } from '$env/dynamic/public';
import { persisted } from '$lib/svelte/stores/persisted';

export const accessToken = persisted<string>('at');

// eslint-disable-next-line import/no-default-export
export default createClient({
  url: `${env.PUBLIC_API_URL}/graphql`,
  headers: () => {
    const token = get(accessToken);

    return {
      ...(token && { authorization: `Bearer ${token}` }),
    };
  },
  cache: {},
  transformError: (error) => error,
  onMutationError: () => {
    // ignore
  },
});
