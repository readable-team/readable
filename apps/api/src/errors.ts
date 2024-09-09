import { GraphQLError } from 'graphql';

type ReadableErrorParams = {
  code: string;
  message?: string;
};

export class ReadableError extends GraphQLError {
  public code: string;

  constructor({ code, message }: ReadableErrorParams) {
    super(message ?? code, { extensions: { type: 'ReadableError', code } });
    this.name = 'ReadableError';
    this.code = code;
  }
}
