import { z } from 'zod';

const schema = z.object({
  ACCESS_TOKEN_JWK: z.string(),
  DASHBOARD_URL: z.string(),
  DATABASE_URL: z.string(),
  GOOGLE_OAUTH_CLIENT_ID: z.string(),
  GOOGLE_OAUTH_CLIENT_SECRET: z.string(),
  PUBLIC_PULUMI_PROJECT: z.string().optional(),
  PUBLIC_PULUMI_STACK: z.string().optional(),
  RABBITMQ_URL: z.string(),
  RESEND_API_KEY: z.string(),
  SENTRY_DSN: z.string().optional(),
  USERCONTENTS_URL: z.string(),
  USERSITE_DEFAULT_HOST: z.string(),
});

export const env = schema.parse(process.env);
export const dev = process.env.NODE_ENV !== 'production';
export const production = process.env.NODE_ENV === 'production';
