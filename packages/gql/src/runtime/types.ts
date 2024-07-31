import type { LoadEvent } from '@sveltejs/kit';
import type { $StoreSchema } from '../types';

export type VariablesFn<Event extends LoadEvent, Schema extends $StoreSchema> = (event: Event) => Schema['$input'];

export type AfterLoadFn<Event extends LoadEvent, Schema extends $StoreSchema> = (
  query: Schema['$output'],
  event: Event,
) => void | Promise<void>;
