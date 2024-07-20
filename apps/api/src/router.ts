import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db, Users } from '@/db';
import { publicProcedure, router } from './trpc';

export const appRouter = router({
  getUserById: publicProcedure.input(z.string()).query(async ({ input }) => {
    const b = await db.select({ id: Users.id }).from(Users).where(eq(Users.id, input));
    return b.length > 0 ? b[0] : null;
  }),
});

export type AppRouter = typeof appRouter;
