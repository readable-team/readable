import { createClient } from '@readable/gql';
import { get } from 'svelte/store';
import { env } from '$env/dynamic/public';
import { persisted } from '$lib/svelte/stores/persisted';

export const accessToken = persisted<string | null>('at');

// eslint-disable-next-line import/no-default-export
export default createClient({
  url: `${env.PUBLIC_API_URL}/graphql`,
  headers: () => {
    const token = get(accessToken);

    return {
      'x-rdbl-svc': 'dashboard',
      ...(token ? { Authorization: `Bearer ${token}` } : undefined),
    };
  },
});
