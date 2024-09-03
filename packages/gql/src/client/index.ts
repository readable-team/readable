import { nanoid } from 'nanoid';
import { connectable, filter, finalize, Observable, share, Subject } from 'rxjs';
import { cacheExchange } from '../exchange/cache';
import { composeExchanges } from '../exchange/compose';
import { fetchExchange } from '../exchange/fetch';
import { sseExchange } from '../exchange/sse';
import type { Connectable } from 'rxjs';
import type { Exchange, ExchangeIO, Operation, OperationResult } from '../exchange/types';
import type { $StoreSchema, StoreSchema } from '../types';

export type GqlClient = {
  client: Client;
};

export const createClient = ({ url, headers, exchanges }: CreateClientParams) => {
  return (): GqlClient => {
    const client = new Client({ url, headers, exchanges });

    return {
      client,
    };
  };
};

type CreateClientParams = {
  url: string;
  headers?: () => Record<string, string>;
  exchanges?: Exchange[];
};

type CreateOperationParams<T extends $StoreSchema> = {
  schema: StoreSchema<T>;
  variables: T['$input'];
  context?: {
    fetch?: typeof globalThis.fetch;
    requestPolicy?: 'cache-only' | 'network-only';
  };
};

class Client {
  private url: string;
  private headers?: () => Record<string, string>;

  private forward: ExchangeIO;
  private operation$: Subject<Operation>;
  private result$: Connectable<OperationResult>;

  constructor({ url, headers, exchanges }: CreateClientParams) {
    this.url = url;
    this.headers = headers;

    const composedExchange = composeExchanges([
      ...(exchanges ?? []),
      cacheExchange,
      fetchExchange,
      sseExchange(url, headers),
    ]);

    this.forward = composedExchange({
      forward: (ops$) => {
        return ops$.pipe(
          filter((operation) => operation.type !== 'teardown'),
          filter((_): _ is never => false),
        );
      },
    });

    this.operation$ = new Subject();
    this.result$ = connectable(this.forward(this.operation$));
    this.result$.connect();
  }

  createOperation<T extends $StoreSchema>({ schema, variables, context }: CreateOperationParams<T>): Operation<T> {
    return {
      key: nanoid(),
      type: schema.kind as 'query' | 'mutation' | 'subscription',
      schema,
      variables,
      context: {
        url: this.url,
        requestPolicy: context?.requestPolicy ?? 'network-only',
        fetch: context?.fetch,
        fetchOpts: {
          headers: this.headers?.(),
        },
      },
    };
  }

  executeOperation<T extends $StoreSchema>(operation: Operation<T>): Observable<OperationResult<T>> {
    const result$ = this.result$.pipe(
      filter((result) => result.operation.key === operation.key),
      finalize(() => {
        this.operation$.next({
          ...operation,
          type: 'teardown',
        });
      }),
      share(),
    );

    this.operation$.next(operation);

    return result$ as Observable<OperationResult<T>>;
  }
}
