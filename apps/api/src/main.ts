import './instrument';
import './jobs';

import { yoga } from '@/handler';

Bun.serve({
  fetch: async (req, server) => {
    const resHeaders = new Headers();
    const res = await yoga(req, { server, resHeaders });

    for (const [key, value] of resHeaders.entries()) {
      res.headers.set(key, value);
    }

    return res;
  },
  port: 3000,
});
