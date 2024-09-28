import type { GraphQLError } from 'graphql';
import type { Observable } from 'rxjs';
import type { $StoreSchema, StoreSchema } from '../types';

export type OperationContext = {
  url: string;
  requestPolicy: 'cache-only' | 'network-only';
  fetch?: typeof globalThis.fetch;
  fetchOpts?: RequestInit;
  extensions?: Record<string, unknown>;
};

export type Operation<T extends $StoreSchema = $StoreSchema> = {
  key: string;
  type: 'query' | 'mutation' | 'subscription' | 'teardown';
  schema: StoreSchema<T>;
  variables: T['$input'];
  context: OperationContext;
};

export type OperationResult<T extends $StoreSchema = $StoreSchema> = {
  operation: Operation<T>;
} & (
  | {
      type: 'data';
      data: T['$output'];
    }
  | {
      type: 'error';
      errors: readonly GraphQLError[];
    }
);

export type ExchangeInput = {
  forward: ExchangeIO;
};

export type ExchangeIO = (ops$: Observable<Operation>) => Observable<OperationResult>;

export type Exchange = (input: ExchangeInput) => ExchangeIO;
