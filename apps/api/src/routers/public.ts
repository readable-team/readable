import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db, first, Sites } from '@/db';
import { SiteState } from '@/enums';
import { env } from '@/env';
import { publicProcedure, router } from '@/trpc';

export const publicRouter = router({
  site: publicProcedure.input(z.object({ host: z.string() })).query(async ({ input }) => {
    if (input.host.endsWith(`.${env.USERSITE_DEFAULT_HOST}`)) {
      const slug = input.host.split('.')[0];

      return await db
        .select({ name: Sites.name })
        .from(Sites)
        .where(and(eq(Sites.slug, slug), eq(Sites.state, SiteState.ACTIVE)))
        .then(first);
    }
  }),
});
