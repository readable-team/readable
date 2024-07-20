import { z } from 'zod';

const schema = z.object({
  ACCESS_TOKEN_JWK: z.string(),
  DATABASE_URL: z.string(),
  GOOGLE_OAUTH_CLIENT_ID: z.string(),
  GOOGLE_OAUTH_CLIENT_SECRET: z.string(),
});

export const env = schema.parse(process.env);
