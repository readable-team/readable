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
});

const createNodeRef = <T extends TableConfig>(name: string, table: TableWithIdColumn<T>) => {
  return builder.loadableNodeRef(name, {
    id: { resolve: (parent) => parent.id },
    ...makeLoadableFields(table),
  });
};

// const createInterfaceRef = <T extends TableConfig>(name: string, table: TableWithIdColumn<T>) => {
//   return builder.loadableInterfaceRef(name, {
//     ...makeLoadableFields(table),
//   });
// };

export const Page = createNodeRef('Page', T.Pages);
export const PageContentSnapshot = createNodeRef('PageContentSnapshot', T.PageContentSnapshots);
export const PageContentState = createNodeRef('PageContentState', T.PageContentStates);
export const Site = createNodeRef('Site', T.Sites);
export const User = createNodeRef('User', T.Users);
export const UserSession = createNodeRef('UserSession', T.UserSessions);
export const UserSingleSignOn = createNodeRef('UserSingleSignOn', T.UserSingleSignOns);
export const Workspace = createNodeRef('Workspace', T.Workspaces);
export const WorkspaceMember = createNodeRef('WorkspaceMember', T.WorkspaceMembers);
export const WorkspaceMemberInvitation = createNodeRef('WorkspaceMemberInvitation', T.WorkspaceMemberInvitations);

Page.implement({});
PageContentSnapshot.implement({});
PageContentState.implement({});
Site.implement({});
User.implement({});
UserSession.implement({});
UserSingleSignOn.implement({});
Workspace.implement({});
WorkspaceMember.implement({});
WorkspaceMemberInvitation.implement({});
