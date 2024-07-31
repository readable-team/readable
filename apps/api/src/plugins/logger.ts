import { logger } from '@/logging';
import type { Plugin } from 'graphql-yoga';
import type { Context } from '@/context';

export const useLogger = (): Plugin<Context> => ({
  onExecute: ({ args }) => {
    logger.info({
      scope: 'graphql',
      ip: args.contextValue.clientAddress,
      user: args.contextValue.session?.userId,
      operation_name: args.operationName,
      variables: args.variableValues,
    });
  },
});
