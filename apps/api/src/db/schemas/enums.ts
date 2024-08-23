import { pgEnum } from 'drizzle-orm/pg-core';
import * as E from '@/enums';

function createPgEnum<T extends string>(enumName: string, obj: Record<string, T>) {
  return pgEnum(enumName, Object.values(obj) as [T, ...T[]]);
}

export const _CategoryState = createPgEnum('_category_state', E.CategoryState);
export const _PageState = createPgEnum('_page_state', E.PageState);
export const _SingleSignOnProvider = createPgEnum('_single_sign_on_provider', E.SingleSignOnProvider);
export const _SiteCustomDomainState = createPgEnum('_site_custom_domain_state', E.SiteCustomDomainState);
export const _SiteState = createPgEnum('_site_state', E.SiteState);
export const _TeamMemberRole = createPgEnum('_team_member_role', E.TeamMemberRole);
export const _TeamState = createPgEnum('_team_state', E.TeamState);
export const _UserState = createPgEnum('_user_state', E.UserState);
