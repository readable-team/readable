import stringify from 'fast-json-stable-stringify';
import { handleStreamOrSingleExecutionResult } from 'graphql-yoga';
import { redis } from '@/cache';
import type { GraphQLParams, Plugin } from 'graphql-yoga';
import type { Context } from '@/context';

const getCacheKey = (request: Request, params: GraphQLParams, siteId?: string) => {
  if (!siteId || !params.extensions?.cache || request.headers.has('authorization')) {
    return null;
  }

  const key = `sitecache:${siteId}`;
  const field = Bun.sha(stringify(params), 'hex');

  return { key, field };
};

export const useCache = (): Plugin<Context> => ({
  onExecute: async ({ args, setResultAndStopExecution }) => {
    const cacheKey = getCacheKey(args.contextValue.request, args.contextValue.params, args.contextValue.site?.id);
    if (!cacheKey) {
      return;
    }

    const resp = await redis.hget(cacheKey.key, cacheKey.field);
    if (resp) {
      setResultAndStopExecution({ data: JSON.parse(resp) });
      return;
    }

    return {
      onExecuteDone: async (payload) => {
        return handleStreamOrSingleExecutionResult(payload, async ({ args, result }) => {
          if (!result.data || result.errors?.length) {
            return;
          }

          const cacheKey = getCacheKey(args.contextValue.request, args.contextValue.params, args.contextValue.site?.id);
          if (!cacheKey) {
            return;
          }

          await redis.hset(cacheKey.key, cacheKey.field, JSON.stringify(result.data));
        });
      },
    };
  },
});
