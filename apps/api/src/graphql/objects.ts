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

// const createInterfaceRef = <T extends TableConfig>(name: string, table: TableWithIdColumn<T>) => {
//   return builder.loadableInterfaceRef(name, {
//     ...makeLoadableFields(table),
//   });
// };

export const Page = createObjectRef('Page', T.Pages);
export const PageContentSnapshot = createObjectRef('PageContentSnapshot', T.PageContentSnapshots);
export const PageContentState = createObjectRef('PageContentState', T.PageContentStates);
export const Site = createObjectRef('Site', T.Sites);
export const User = createObjectRef('User', T.Users);
export const Workspace = createObjectRef('Workspace', T.Workspaces);
export const WorkspaceMember = createObjectRef('WorkspaceMember', T.WorkspaceMembers);
export const WorkspaceMemberInvitation = createObjectRef('WorkspaceMemberInvitation', T.WorkspaceMemberInvitations);
