// spell-checker:ignoreRegExp /createDbId\('[A-Z]{1,4}'/g

import { eq, sql } from 'drizzle-orm';
import { bigint, index, integer, pgTable, text, unique, uniqueIndex } from 'drizzle-orm/pg-core';
import * as E from './enums';
import { createDbId } from './id';
import { bytea, datetime, jsonb } from './types';
import type { JSONContent } from '@tiptap/core';
import type { AnyPgColumn } from 'drizzle-orm/pg-core';
import type { PlanRules } from './json';

export const Categories = pgTable(
  'categories',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createDbId('CTG')),
    siteId: text('site_id')
      .notNull()
      .references(() => Sites.id),
    name: text('name').notNull(),
    state: E._CategoryState('state').notNull().default('ACTIVE'),
    order: bytea('order').notNull(),
    createdAt: datetime('created_at')
      .notNull()
      .default(sql`now()`),
  },
  (t) => ({
    siteIdOrderUniq: unique().on(t.siteId, t.order),
  }),
);

export const Embeds = pgTable('embeds', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createDbId('EMBD')),
  url: text('url').notNull().unique(),
  type: text('type').notNull(),
  title: text('title'),
  description: text('description'),
  html: text('html'),
  thumbnailUrl: text('thumbnail_url'),
  createdAt: datetime('created_at')
    .notNull()
    .default(sql`now()`),
});

export const Files = pgTable('files', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createDbId('FILE')),
  userId: text('user_id').references(() => Users.id),
  name: text('name').notNull(),
  format: text('format').notNull(),
  size: integer('size').notNull(),
  path: text('path').notNull(),
  createdAt: datetime('created_at')
    .notNull()
    .default(sql`now()`),
});

export const Images = pgTable('images', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createDbId('IMG')),
  userId: text('user_id').references((): AnyPgColumn => Users.id),
  name: text('name').notNull(),
  format: text('format').notNull(),
  size: integer('size').notNull(),
  width: integer('width').notNull(),
  height: integer('height').notNull(),
  placeholder: text('placeholder').notNull(),
  path: text('path').notNull(),
  createdAt: datetime('created_at')
    .notNull()
    .default(sql`now()`),
});

export const Pages = pgTable(
  'pages',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createDbId('P', { length: 'short' })),
    siteId: text('site_id')
      .notNull()
      .references(() => Sites.id),
    categoryId: text('category_id')
      .notNull()
      .references(() => Categories.id),
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

export const PageContents = pgTable(
  'page_contents',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createDbId('PCC')),
    pageId: text('page_id')
      .notNull()
      .unique()
      .references(() => Pages.id),
    title: text('title'),
    subtitle: text('subtitle'),
    content: jsonb('content').notNull().$type<JSONContent>(),
    text: text('text').notNull(),
    summary: text('summary'),
    createdAt: datetime('created_at')
      .notNull()
      .default(sql`now()`),
    updatedAt: datetime('updated_at')
      .notNull()
      .default(sql`now()`),
  },
  (t) => ({
    pageIdCreatedAtIdx: index().on(t.pageId, t.createdAt),
  }),
);

export const PageContentContributors = pgTable(
  'page_content_contributors',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createDbId('PCED')),
    pageId: text('page_id')
      .notNull()
      .references(() => Pages.id),
    userId: text('user_id')
      .notNull()
      .references(() => Users.id),
    createdAt: datetime('created_at')
      .notNull()
      .default(sql`now()`),
    updatedAt: datetime('updated_at')
      .notNull()
      .default(sql`now()`),
  },
  (t) => ({
    pageIdUserIdUniq: unique().on(t.pageId, t.userId),
    pageIdUpdatedAtIdx: index().on(t.pageId, t.updatedAt),
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
  updatedAt: datetime('updated_at')
    .notNull()
    .default(sql`now()`),
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

export const Plans = pgTable('plans', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createDbId('PLN')),
  name: text('name').notNull(),
  rules: jsonb('rules').notNull().$type<Partial<PlanRules>>(),
  createdAt: datetime('created_at')
    .notNull()
    .default(sql`now()`),
});

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
    logoId: text('logo_id').references(() => Images.id),
    themeColor: text('theme_color').notNull(),
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

export const SiteCustomDomains = pgTable(
  'site_custom_domains',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createDbId('SCD')),
    siteId: text('site_id')
      .notNull()
      .references(() => Sites.id),
    domain: text('domain').notNull(),
    state: E._SiteCustomDomainState('state').notNull(),
    createdAt: datetime('created_at')
      .notNull()
      .default(sql`now()`),
  },
  (t) => ({
    domainUniqIdx: uniqueIndex().on(t.domain).where(eq(t.state, 'ACTIVE')),
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
    planId: text('plan_id')
      .notNull()
      .references(() => Plans.id),
    avatarId: text('avatar_id')
      .notNull()
      .references(() => Images.id),
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
    avatarId: text('avatar_id')
      .notNull()
      .references(() => Images.id),
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
