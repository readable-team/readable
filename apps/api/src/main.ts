import '@/instrument';
import '@readable/lib/dayjs';
import '@/jobs';

import { Elysia } from 'elysia';
import { yoga } from '@/handler';
import { elysia } from '@/rest';
import { ip } from './plugins/ip';

new Elysia()
  .use(ip)
  .use(elysia)
  .all('/graphql', ({ request, ip }) => yoga(request, { ip }))
  .listen(3000, (server) => {
    console.log(`Listening on ${server.url}`);
  });
