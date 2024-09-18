import { createClient, errorExchange } from '@readable/gql';
import { ReadableError } from '@/errors';
import { browser } from '$app/environment';
import { env } from '$env/dynamic/public';

// eslint-disable-next-line import/no-default-export
export default createClient({
  url: () => `${browser ? env.PUBLIC_API_URL : env.PUBLIC_API_INTERNAL_URL}/graphql`,
  headers: () => ({
    'x-rdbl-svc': 'usersite',
  }),
  exchanges: [
    errorExchange((error) => {
      if (error.extensions.type === 'ReadableError') {
        return new ReadableError({
          code: error.extensions.code as string,
          message: error.message,
        });
      }

      return error;
    }),
  ],
});
