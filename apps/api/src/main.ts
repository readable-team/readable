import '@/instrument';
import '@readable/lib/dayjs';
import '@/jobs';

import { Elysia } from 'elysia';
import { yoga } from '@/handler';
import { elysia } from '@/rest';

new Elysia()
  .use(elysia)
  .use(yoga)
  .listen(3000, (server) => {
    console.log(`Listening on ${server.url}`);
  });
