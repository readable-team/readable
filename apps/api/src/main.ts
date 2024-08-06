import './instrument';
import '@readable/lib/dayjs';
import './jobs';

import { yoga } from '@/handler';

Bun.serve({
  fetch: (req, server) => yoga(req, { server }),
  port: 3000,
});
