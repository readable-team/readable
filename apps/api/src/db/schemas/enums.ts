import { pgEnum } from 'drizzle-orm/pg-core';
import * as E from '@/enums';

function createPgEnum<T extends string>(enumName: string, obj: Record<string, T>) {
  return pgEnum(enumName, Object.values(obj) as [T, ...T[]]);
}

export const _PageState = createPgEnum('_page_state', E.PageState);
export const _SingleSignOnProvider = createPgEnum('_single_sign_on_provider', E.SingleSignOnProvider);
export const _SiteState = createPgEnum('_site_state', E.SiteState);
export const _UserState = createPgEnum('_user_state', E.UserState);
export const _WorkspaceMemberRole = createPgEnum('_workspace_member_role', E.WorkspaceMemberRole);
export const _WorkspaceState = createPgEnum('_workspace_state', E.WorkspaceState);
