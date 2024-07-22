import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db, firstOrThrow, Images } from '@/db';
import { publicProcedure, router } from '@/trpc';

export const imageRouter = router({
  get: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    return await db.select({ path: Images.path }).from(Images).where(eq(Images.id, input.id)).then(firstOrThrow);
  }),
});
