import * as Sentry from '@sentry/sveltekit';
import { logger } from '../logging';
import type { Handle } from '@sveltejs/kit';

export const logging: Handle = async ({ event, resolve }) => {
  logger.info({
    scope: 'http',
    ip: event.getClientAddress(),
    method: event.request.method,
    path: event.url.pathname,
    ua: event.request.headers.get('user-agent'),
  });

  return await resolve(event);
};

export const sentry: Handle = Sentry.sentryHandle();

export const handleError = Sentry.handleErrorWithSentry(() => {
  /* pass */
});
