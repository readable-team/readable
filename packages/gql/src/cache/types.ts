import type { entityLinkKey, rootFieldKey } from './const';

type Arrayable<T> = T | T[];

export type Typename = string;
export type ID = string;

export type KeyableEntity = {
  [key: string]: unknown;
  __typename: Typename;
  id: ID;
};

export type EntityKey = `${Typename}:${ID}`;
export type EntityLink = { [entityLinkKey]: EntityKey };

export type StorageKey = EntityKey | typeof rootFieldKey;
export type Storage = Record<StorageKey, Field>;

export type FieldKey = string | `${string}@${string}`;
export type Scalar = string | number | boolean | null | undefined;
export type FieldValue = Arrayable<Scalar | EntityLink | { [key: FieldKey]: FieldValue }>;
export type Field = Record<FieldKey, FieldValue>;

export type Data = { [key: string]: Arrayable<Scalar | Data> };
export type Variables = Record<string, unknown>;
