import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db, Images } from '@/db';
import { publicProcedure, router } from '@/trpc';

export const imageRouter = router({
  get: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    const images = await db.select({ path: Images.path }).from(Images).where(eq(Images.id, input.id));

    if (images.length === 0) {
      throw new TRPCError({ code: 'NOT_FOUND' });
    }

    return images[0];
  }),
});
