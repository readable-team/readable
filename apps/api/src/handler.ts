import { useGraphQlJit } from '@envelop/graphql-jit';
import { createYoga, useExecutionCancellation } from 'graphql-yoga';
import { createContext } from '@/context';
import { schema } from '@/graphql';
import { useLogger } from './plugins/logger';

export const yoga = createYoga({
  schema,
  context: createContext,
  graphqlEndpoint: '/graphql',
  batching: true,
  maskedErrors: false,
  landingPage: false,
  healthCheckEndpoint: '/healthz',
  plugins: [useGraphQlJit(), useExecutionCancellation(), useLogger()],
});
