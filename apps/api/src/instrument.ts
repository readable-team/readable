import * as Sentry from '@sentry/bun';
import { env } from '@/env';

Sentry.init({
  enabled: process.env.NODE_ENV === 'production',
  dsn: env.SENTRY_DSN,
  environment: env.PUBLIC_PULUMI_STACK,
});
