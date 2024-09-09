import { getClientAddress } from '@readable/lib';
import Elysia from 'elysia';
import { createYoga, useExecutionCancellation } from 'graphql-yoga';
import { createContext } from '@/context';
import { schema } from '@/graphql';
import { useLogger } from './plugins/logger';

export const yoga = new Elysia({ prefix: '/graphql' });

const app = createYoga({
  schema,
  context: createContext,
  graphqlEndpoint: '/graphql',
  batching: true,
  maskedErrors: false,
  landingPage: false,
  plugins: [useExecutionCancellation(), useLogger()],
});

yoga.all('/', (ctx) => app(ctx.request, { ip: getClientAddress(ctx.request, ctx.server) }));
