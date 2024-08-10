import './instrument';
import '@readable/lib/dayjs';
import './jobs';

import { Hono } from 'hono';
import { yoga } from '@/handler';
import { hono } from './rest';

const app = new Hono();

app.all('/graphql', (c) => yoga.handle(c.req.raw, { hono: c }));
app.route('/', hono);

Bun.serve({
  fetch: app.fetch,
  port: 3000,
});
