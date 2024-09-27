import '@readable/lib/dayjs';

import * as Sentry from '@sentry/sveltekit';
import { dev } from '$app/environment';
import { env } from '$env/dynamic/public';

Sentry.init({
  enabled: !dev,
  dsn: env.PUBLIC_SENTRY_DSN,
  environment: env.PUBLIC_PULUMI_STACK,
});

export const handleError = Sentry.handleErrorWithSentry();
