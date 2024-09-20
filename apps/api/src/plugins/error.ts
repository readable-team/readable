import { isAsyncIterable } from '@envelop/core';
import * as Sentry from '@sentry/bun';
import { GraphQLError } from 'graphql';
import { dev } from '@/env';
import { ReadableError } from '@/errors';
import type { AsyncIterableIteratorOrValue, ExecutionResult } from '@envelop/core';
import type { Plugin } from 'graphql-yoga';

class UnexpectedError extends GraphQLError {
  public eventId: string;

  constructor(error: Error) {
    const eventId = Sentry.captureException(error);

    super(dev ? error.message : 'Unexpected error', {
      extensions: { type: 'UnexpectedError', code: 'UNEXPECTED_ERROR', eventId },
      originalError: dev ? error : undefined,
    });

    this.eventId = eventId;
  }
}

const transformError = (error: unknown): GraphQLError => {
  if (error instanceof ReadableError) {
    return error;
  } else if (error instanceof GraphQLError && error.originalError) {
    return transformError(error.originalError);
  } else if (error instanceof Error) {
    return new UnexpectedError(error);
  } else {
    return new UnexpectedError(new Error(String(error)));
  }
};

type ErrorHandlerPayload = { error: unknown; setError: (err: unknown) => void };
const errorHandler = ({ error, setError }: ErrorHandlerPayload) => {
  setError(transformError(error));
};

type ResultHandlerPayload<T> = { result: T; setResult: (result: T) => void };
const resultHandler = ({ result, setResult }: ResultHandlerPayload<AsyncIterableIteratorOrValue<ExecutionResult>>) => {
  const handler = ({ result, setResult }: ResultHandlerPayload<ExecutionResult>) => {
    if (result.errors) {
      setResult({
        ...result,
        errors: result.errors.map((error) => transformError(error)),
      });
    }
  };

  if (isAsyncIterable(result)) {
    return { onNext: handler };
  } else {
    handler({ result, setResult });
    return;
  }
};

export const useError = (): Plugin => {
  return {
    onPluginInit: ({ registerContextErrorHandler }) => {
      registerContextErrorHandler(errorHandler);
    },
    onExecute: () => ({
      onExecuteDone: resultHandler,
    }),
    onSubscribe: () => ({
      onSubscribeResult: resultHandler,
      onSubscribeError: errorHandler,
    }),
  };
};
