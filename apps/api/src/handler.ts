import { useGraphQlJit } from '@envelop/graphql-jit';
import { createYoga } from 'graphql-yoga';
import { createContext } from '@/context';
import { schema } from './graphql';

export const yoga = createYoga({
  schema,
  context: createContext,
  graphqlEndpoint: '/graphql',
  batching: true,
  maskedErrors: false,
  landingPage: false,
  healthCheckEndpoint: '/healthz',
  plugins: [useGraphQlJit()],
});
