import { createYoga, useExecutionCancellation } from 'graphql-yoga';
import { createContext } from '@/context';
import { dev } from '@/env';
import { schema } from '@/graphql';
import { useLogger } from './plugins/logger';

export const yoga = createYoga({
  schema,
  context: createContext,
  graphqlEndpoint: '/graphql',
  batching: true,
  maskedErrors: { isDev: dev },
  landingPage: false,
  plugins: [useExecutionCancellation(), useLogger()],
});
