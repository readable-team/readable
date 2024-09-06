import type { Config } from 'drizzle-kit';

export default {
  strict: true,
  verbose: true,

  schema: './src/db/schemas/*',
  out: './drizzle',

  dialect: 'postgresql',
  dbCredentials: {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    url: process.env.DATABASE_URL!,
  },

  tablesFilter: ['!pg_stat_statements', '!pg_stat_statements_info'],

  breakpoints: false,
} satisfies Config;
