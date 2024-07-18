import { trpcServer } from '@hono/trpc-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { createContext } from './context';
import { appRouter } from './router';

const app = new Hono();

app.use('*', cors());

app.use(
  '/trpc/*',
  trpcServer({
    router: appRouter,
    createContext,
  }),
);

// eslint-disable-next-line import/no-default-export
export default app;
