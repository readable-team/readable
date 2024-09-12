import { asc, inArray } from 'drizzle-orm';
import { builder } from '@/builder';
import { db } from '@/db';
import * as T from '@/db/schemas/tables';
import type { DataLoaderOptions } from '@pothos/plugin-dataloader';
import type { AnyPgColumn, AnyPgTable, PgTable, TableConfig } from 'drizzle-orm/pg-core';
import type { Builder } from '@/builder';

type IdColumn = AnyPgColumn<{ data: string; notNull: true }>;
type TableWithIdColumn<T extends TableConfig> = AnyPgTable<{ columns: { id: IdColumn } }> & {
  id: IdColumn;
} & PgTable<T>;

type SchemaTypes = Builder extends PothosSchemaTypes.SchemaBuilder<infer T> ? T : never;

const makeLoadableFields = <T extends TableConfig>(
  table: TableWithIdColumn<T>,
): DataLoaderOptions<SchemaTypes, typeof table.$inferSelect, string, string, typeof table.$inferSelect> => ({
  load: (ids) => db.select().from(table).where(inArray(table.id, ids)).orderBy(asc(table.id)),
  toKey: (parent) => parent.id,
  sort: true,
  cacheResolved: true,
  loaderOptions: {
    cache: false,
  },
});

const createObjectRef = <T extends TableConfig>(name: string, table: TableWithIdColumn<T>) => {
  return builder.loadableObjectRef(name, {
    ...makeLoadableFields(table),
  });
};

const createInterfaceRef = <T extends TableConfig>(name: string, table: TableWithIdColumn<T>) => {
  return builder.loadableInterfaceRef(name, {
    ...makeLoadableFields(table),
  });
};

export const ICategory = createInterfaceRef('ICategory', T.Categories);
export const IPage = createInterfaceRef('IPage', T.Pages);
export const ISite = createInterfaceRef('ISite', T.Sites);

export const Category = createObjectRef('Category', T.Categories);
export const Embed = createObjectRef('Embed', T.Embeds);
export const File = createObjectRef('File', T.Files);
export const Image = createObjectRef('Image', T.Images);
export const Page = createObjectRef('Page', T.Pages);
export const PageContentContributor = createObjectRef('PageContentContributor', T.PageContentContributors);
export const PageContentState = createObjectRef('PageContentState', T.PageContentStates);
export const PaymentMethod = createObjectRef('PaymentMethod', T.PaymentMethods);
export const Plan = createObjectRef('Plan', T.Plans);
export const Site = createObjectRef('Site', T.Sites);
export const SiteCustomDomain = createObjectRef('SiteCustomDomain', T.SiteCustomDomains);
export const Team = createObjectRef('Team', T.Teams);
export const TeamMember = createObjectRef('TeamMember', T.TeamMembers);
export const TeamMemberInvitation = createObjectRef('TeamMemberInvitation', T.TeamMemberInvitations);
export const User = createObjectRef('User', T.Users);

export const PublicCategory = createObjectRef('PublicCategory', T.Categories);
export const PublicPage = createObjectRef('PublicPage', T.Pages);
export const PublicSite = createObjectRef('PublicSite', T.Sites);
export const PublicPageContent = createObjectRef('PublicPageContent', T.PageContents);

type BlobShape = { id: string; path: string };
export const Blob = builder.interfaceRef<BlobShape>('Blob');
