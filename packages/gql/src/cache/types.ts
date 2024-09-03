import type { entityLinkKey, rootFieldKey } from './const';

export type Typename = string & { __brand: 'Typename' };
export type ID = string & { __brand: 'ID' };

export type QueryKey = string;
export type EntityKey = `${Typename}:${ID}`;

export type KeyableEntity = {
  [key: string]: unknown;
  __typename: Typename;
  id: ID;
};

export type EntityLink = {
  [entityLinkKey]: EntityKey;
};

export type FieldKey = string | `${string}@${string}` | typeof rootFieldKey;

export type Data = Readonly<Record<string, unknown>>;
export type Variables = Readonly<Record<string, unknown>>;

export type Storage = Record<FieldKey, unknown>;
