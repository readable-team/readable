import { client } from '$lib/client';

export const load = async () => {
  return {
    user: await client.getUserById.query('1'),
  };
};
