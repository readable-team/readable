// spell-checker:ignoreRegExp /createDbId\('[A-Z]{1,4}'/g

import { sql } from 'drizzle-orm';
import { bigint, index, pgTable, text, unique, uniqueIndex } from 'drizzle-orm/pg-core';
import * as E from './enums';
import { createDbId } from './id';
import { bytea, datetime, jsonb } from './types';
import type { JSONContent } from '@tiptap/core';
import type { AnyPgColumn } from 'drizzle-orm/pg-core';

export const Pages = pgTable(
  'pages',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createDbId('P', { length: 'short' })),
    siteId: text('site_id')
      .notNull()
      .references(() => Sites.id),
    parentId: text('parent_id').references((): AnyPgColumn => Pages.id),
    slug: text('slug').notNull(),
    state: E._PageState('state').notNull(),
    order: bytea('order').notNull(),
    createdAt: datetime('created_at')
      .notNull()
      .default(sql`now()`),
  },
  (t) => ({
    siteIdStateIdx: index().on(t.siteId, t.state),
    siteIdSlugUniq: unique().on(t.siteId, t.slug),
    siteIdParentIdOrderUniq: unique().on(t.siteId, t.parentId, t.order).nullsNotDistinct(),
  }),
);

export const PageContentSnapshots = pgTable(
  'page_content_snapshots',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createDbId('PCSN')),
    pageId: text('page_id')
      .notNull()
      .references(() => Pages.id),
    snapshot: bytea('snapshot').notNull(),
    createdAt: datetime('created_at')
      .notNull()
      .default(sql`now()`),
  },
  (t) => ({
    pageIdCreatedAtIdx: index().on(t.pageId, t.createdAt),
  }),
);

export const PageContentStates = pgTable('page_content_states', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createDbId('PCST')),
  pageId: text('page_id')
    .notNull()
    .unique()
    .references(() => Pages.id),
  update: bytea('update').notNull(),
  vector: bytea('vector').notNull(),
  upToSeq: bigint('up_to_seq', { mode: 'bigint' }).notNull(),
  title: text('title'),
  subtitle: text('subtitle'),
  content: jsonb('content').notNull().$type<JSONContent>(),
  text: text('text').notNull(),
  createdAt: datetime('created_at')
    .notNull()
    .default(sql`now()`),
  updatedAt: datetime('updated_at'),
});

export const PageContentUpdates = pgTable(
  'page_content_updates',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createDbId('PCUP', { length: 'long' })),
    pageId: text('page_id')
      .notNull()
      .references(() => Pages.id),
    userId: text('user_id')
      .notNull()
      .references(() => Users.id),
    update: bytea('update').notNull(),
    seq: bigint('seq', { mode: 'bigint' }).notNull().generatedAlwaysAsIdentity(),
    createdAt: datetime('created_at')
      .notNull()
      .default(sql`now()`),
  },
  (t) => ({
    pageIdSeqIdx: index().on(t.pageId, t.seq),
  }),
);

export const Sites = pgTable(
  'sites',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createDbId('S', { length: 'short' })),
    teamId: text('team_id')
      .notNull()
      .references(() => Teams.id),
    slug: text('slug').notNull(),
    name: text('name').notNull(),
    state: E._SiteState('state').notNull().default('ACTIVE'),
    logoUrl: text('logo_url'),
    createdAt: datetime('created_at')
      .notNull()
      .default(sql`now()`),
  },
  (t) => ({
    slugStateIdx: index().on(t.slug, t.state),
    slugUniqIdx: uniqueIndex()
      .on(t.slug)
      .where(sql`${t.state} = 'ACTIVE'`),
  }),
);

export const Teams = pgTable(
  'teams',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createDbId('T', { length: 'short' })),
    name: text('name').notNull(),
    state: E._TeamState('state').notNull().default('ACTIVE'),
    createdAt: datetime('created_at')
      .notNull()
      .default(sql`now()`),
  },
  (t) => ({
    stateIdx: index().on(t.state),
  }),
);

export const TeamMembers = pgTable(
  'team_members',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createDbId('TM')),
    teamId: text('team_id')
      .notNull()
      .references(() => Teams.id),
    userId: text('user_id')
      .notNull()
      .references(() => Users.id),
    role: E._TeamMemberRole('role').notNull(),
    createdAt: datetime('created_at')
      .notNull()
      .default(sql`now()`),
  },
  (t) => ({
    userIdTeamIdUniq: unique().on(t.userId, t.teamId),
    teamIdUserIdRoleIdx: index().on(t.teamId, t.userId, t.role),
  }),
);

export const TeamMemberInvitations = pgTable('team_member_invitations', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createDbId('TMIV')),
  teamId: text('team_id')
    .notNull()
    .references(() => Teams.id),
  email: text('email').notNull(),
  createdAt: datetime('created_at')
    .notNull()
    .default(sql`now()`),
  expiresAt: datetime('expires_at').notNull(),
});

export const Users = pgTable(
  'users',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createDbId('U', { length: 'short' })),
    email: text('email').notNull(),
    name: text('name').notNull(),
    avatarUrl: text('avatar_url').notNull(),
    state: E._UserState('state').notNull().default('ACTIVE'),
    createdAt: datetime('created_at')
      .notNull()
      .default(sql`now()`),
  },
  (t) => ({
    emailStateIdx: index().on(t.email, t.state),
    emailUniqIdx: uniqueIndex()
      .on(t.email)
      .where(sql`${t.state} = 'ACTIVE'`),
  }),
);

export const UserSessions = pgTable(
  'user_sessions',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createDbId('USES')),
    userId: text('user_id')
      .notNull()
      .references(() => Users.id),
    createdAt: datetime('created_at')
      .notNull()
      .default(sql`now()`),
  },
  (t) => ({
    userIdIdx: index().on(t.userId),
  }),
);

export const UserSingleSignOns = pgTable(
  'user_single_sign_ons',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createDbId('USSO')),
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
    providerPrincipalUniq: unique().on(t.provider, t.principal),
  }),
);
