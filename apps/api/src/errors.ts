import { GraphQLError } from 'graphql';

type ApiErrorParams = {
  code: string;
};

export class ApiError extends GraphQLError {
  constructor({ code }: ApiErrorParams) {
    super('ApiError', { extensions: { code } });
    this.name = 'ApiError';
  }
}
