export type PageContentSyncKind = keyof typeof PageContentSyncKind;
export const PageContentSyncKind = {
  PING: 'PING',
  UPDATE: 'UPDATE',
  SYNCHRONIZE_1: 'SYNCHRONIZE_1',
  SYNCHRONIZE_2: 'SYNCHRONIZE_2',
  SYNCHRONIZE_3: 'SYNCHRONIZE_3',
  AWARENESS: 'AWARENESS',
} as const;

export type PageState = keyof typeof PageState;
export const PageState = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  DELETED: 'DELETED',
} as const;

export type SingleSignOnProvider = keyof typeof SingleSignOnProvider;
export const SingleSignOnProvider = {
  GOOGLE: 'GOOGLE',
} as const;

export type SiteCustomDomainState = keyof typeof SiteCustomDomainState;
export const SiteCustomDomainState = {
  ACTIVE: 'ACTIVE',
  PENDING: 'PENDING',
} as const;

export type SiteState = keyof typeof SiteState;
export const SiteState = {
  ACTIVE: 'ACTIVE',
  DELETED: 'DELETED',
} as const;

export type TeamMemberRole = keyof typeof TeamMemberRole;
export const TeamMemberRole = {
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
} as const;

export type TeamState = keyof typeof TeamState;
export const TeamState = {
  ACTIVE: 'ACTIVE',
  DELETED: 'DELETED',
} as const;

export type UserState = keyof typeof UserState;
export const UserState = {
  ACTIVE: 'ACTIVE',
  DEACTIVATED: 'DEACTIVATED',
} as const;
