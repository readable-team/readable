import { z } from 'zod';

const schema = z.object({
  ACCESS_TOKEN_JWK: z.string(),
  DASHBOARD_URL: z.string(),
  DATABASE_URL: z.string(),
  GOOGLE_OAUTH_CLIENT_ID: z.string(),
  GOOGLE_OAUTH_CLIENT_SECRET: z.string(),
  PUBLIC_PULUMI_PROJECT: z.string().optional(),
  PUBLIC_PULUMI_STACK: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
});

export const env = schema.parse(process.env);
