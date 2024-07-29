import { init } from '@paralleldrive/cuid2';
import { sql } from 'drizzle-orm';
import { bigint, bigserial, index, pgTable, text, uniqueIndex } from 'drizzle-orm/pg-core';
import * as E from './enums';
import { bytea, datetime } from './types';
import type { AnyPgColumn } from 'drizzle-orm/pg-core';

export const createDbId = init({ length: 16 });

export const Pages = pgTable(
  'pages',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createDbId()),
    siteId: text('site_id')
      .notNull()
      .references(() => Sites.id),
    parentId: text('parent_id').references((): AnyPgColumn => Pages.id),
    state: E._PageState('state').notNull(),
    createdAt: datetime('created_at')
      .notNull()
      .default(sql`now()`),
  },
  (t) => ({
    siteIdStateIdx: index().on(t.siteId, t.state),
  }),
);

export const PageContentSnapshots = pgTable(
  'page_content_snapshots',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createDbId()),
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
    .$defaultFn(() => createDbId()),
  pageId: text('page_id')
    .notNull()
    .unique()
    .references(() => Pages.id),
  update: bytea('update').notNull(),
  vector: bytea('vector').notNull(),
  upToSeq: bigint('up_to_seq', { mode: 'bigint' }).notNull(),
  createdAt: datetime('created_at')
    .notNull()
    .default(sql`now()`),
  updatedAt: datetime('updated_at'),
});

export const PageContentUpdates = pgTable('page_content_updates', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createDbId()),
  pageId: text('page_id')
    .notNull()
    .references(() => Pages.id),
  userId: text('user_id')
    .notNull()
    .references(() => Users.id),
  update: bytea('update').notNull(),
  seq: bigserial('seq', { mode: 'bigint' }).notNull(),
  createdAt: datetime('created_at')
    .notNull()
    .default(sql`now()`),
});

export const Sites = pgTable(
  'sites',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createDbId()),
    workspaceId: text('workspace_id')
      .notNull()
      .references(() => Workspaces.id),
    slug: text('slug').notNull(),
    name: text('name').notNull(),
    state: E._SiteState('state').notNull().default('ACTIVE'),
    createdAt: datetime('created_at')
      .notNull()
      .default(sql`now()`),
  },
  (t) => ({
    slugStateIdx: index().on(t.slug, t.state),
  }),
);

export const Users = pgTable(
  'users',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createDbId()),
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
  }),
);

export const UserSessions = pgTable(
  'user_sessions',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createDbId()),
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

export const Workspaces = pgTable(
  'workspaces',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createDbId()),
    name: text('name').notNull(),
    state: E._WorkspaceState('state').notNull().default('ACTIVE'),
    createdAt: datetime('created_at')
      .notNull()
      .default(sql`now()`),
  },
  (t) => ({
    stateIdx: index().on(t.state),
  }),
);

export const WorkspaceMembers = pgTable(
  'workspace_members',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createDbId()),
    workspaceId: text('workspace_id')
      .notNull()
      .references(() => Workspaces.id),
    userId: text('user_id')
      .notNull()
      .references(() => Users.id),
    role: E._WorkspaceMemberRole('role').notNull(),
    createdAt: datetime('created_at')
      .notNull()
      .default(sql`now()`),
  },
  (t) => ({
    userIdWorkspaceIdUniqIdx: uniqueIndex().on(t.userId, t.workspaceId),
    workspaceIdUserIdRoleIdx: index().on(t.workspaceId, t.userId, t.role),
  }),
);

export const WorkspaceMemberInvitations = pgTable('workspace_member_invitations', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createDbId()),
  workspaceId: text('workspace_id')
    .notNull()
    .references(() => Workspaces.id),
  email: text('email').notNull(),
  createdAt: datetime('created_at')
    .notNull()
    .default(sql`now()`),
  expiresAt: datetime('expires_at').notNull(),
});
