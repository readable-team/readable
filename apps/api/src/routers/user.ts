import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { db, Users } from '@/db';
import { router, sessionProcedure } from '@/trpc';

export const userRouter = router({
  me: sessionProcedure.query(async ({ ctx }) => {
    const users = await db
      .select({ id: Users.id, email: Users.email })
      .from(Users)
      .where(eq(Users.id, ctx.session.userId));

    if (users.length === 0) {
      throw new TRPCError({ code: 'NOT_FOUND' });
    }

    return users[0];
  }),
});
