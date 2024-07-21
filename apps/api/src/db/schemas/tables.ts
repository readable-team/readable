import { init } from '@paralleldrive/cuid2';
import { sql } from 'drizzle-orm';
import { index, integer, pgTable, text, uniqueIndex } from 'drizzle-orm/pg-core';
import * as E from './enums';
import { datetime } from './types';
import type { AnyPgColumn } from 'drizzle-orm/pg-core';

export const createDbId = init({ length: 16 });

export const Images = pgTable('images', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createDbId()),
  name: text('name').notNull(),
  format: text('format').notNull(),
  size: integer('size').notNull(),
  width: integer('width').notNull(),
  height: integer('height').notNull(),
  path: text('path').notNull(),
  color: text('color').notNull(),
  placeholder: text('placeholder').notNull(),
  hash: text('hash').notNull(),
  createdAt: datetime('created_at')
    .notNull()
    .default(sql`now()`),
});

export const Users = pgTable(
  'users',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createDbId()),
    email: text('email').notNull(),
    name: text('name').notNull(),
    avatarId: text('avatar_id')
      .notNull()
      .references((): AnyPgColumn => Images.id),
    state: E._UserState('state').notNull().default('ACTIVE'),
    createdAt: datetime('created_at')
      .notNull()
      .default(sql`now()`),
  },
  (t) => ({
    emailStateIdx: index().on(t.email, t.state),
  }),
);

export const UserSessions = pgTable('user_sessions', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createDbId()),
  userId: text('user_id')
    .notNull()
    .references(() => Users.id),
  createdAt: datetime('created_at')
    .notNull()
    .default(sql`now()`),
});

export const UserSingleSignOns = pgTable(
  'user_single_sign_ons',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createDbId()),
    userId: text('user_id')
      .notNull()
      .unique()
      .references(() => Users.id),
    provider: E._SingleSignOnProvider('provider').notNull(),
    principal: text('principal').notNull(),
    email: text('email').notNull(),
    createdAt: datetime('created_at')
      .notNull()
      .default(sql`now()`),
  },
  (t) => ({
    providerPrincipalUniqIdx: uniqueIndex().on(t.provider, t.principal),
  }),
);
