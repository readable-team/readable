import './instrument';
import './jobs';

import { yoga } from '@/handler';

Bun.serve({
  fetch: (req, server) => yoga.fetch(req, { server }),
  port: 3000,
});
