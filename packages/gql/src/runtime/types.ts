import type { LoadEvent } from '@sveltejs/kit';
import type { $StoreSchema } from '../types';

type Awaitable<T> = T | Promise<T>;

export type VariablesFn<Event extends LoadEvent, Schema extends $StoreSchema> = (
  event: Event,
) => Awaitable<Schema['$input']>;

export type AfterLoadFn<Event extends LoadEvent, Schema extends $StoreSchema> = (
  query: Schema['$output'],
  event: Event,
) => Awaitable<void>;

export type OnErrorFn<Event extends LoadEvent> = (error: unknown, event: Event) => Awaitable<void>;
