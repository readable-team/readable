import { init } from '@paralleldrive/cuid2';
import { sql } from 'drizzle-orm';
import { index, pgTable, text } from 'drizzle-orm/pg-core';
import * as E from './enums';
import { datetime } from './types';

const createId = init({ length: 16 });

export const Users = pgTable(
  'users',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    email: text('email').notNull(),
    state: E._UserState('state').notNull().default('ACTIVE'),
    createdAt: datetime('created_at')
      .notNull()
      .default(sql`now()`),
  },
  (t) => ({
    emailStateIdx: index().on(t.email, t.state),
  }),
);
