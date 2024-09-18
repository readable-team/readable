import { createClient, errorExchange } from '@readable/gql';
import { ReadableError } from '@/errors';
import { env } from '$env/dynamic/public';

// eslint-disable-next-line import/no-default-export
export default createClient({
  url: `${env.PUBLIC_API_URL}/graphql`,
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
