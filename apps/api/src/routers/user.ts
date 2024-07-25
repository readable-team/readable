import { eq } from 'drizzle-orm';
import { db, firstOrThrow, Users } from '@/db';
import { inputSchemas } from '@/schemas';
import { router, sessionProcedure } from '@/trpc';

export const userRouter = router({
  me: sessionProcedure.query(async ({ ctx }) => {
    return await db
      .select({ id: Users.id, email: Users.email, name: Users.name, avatarUrl: Users.avatarUrl })
      .from(Users)
      .where(eq(Users.id, ctx.session.userId))
      .then(firstOrThrow);
  }),

  update: sessionProcedure.input(inputSchemas.user.update).mutation(async ({ input, ctx }) => {
    await db.update(Users).set({ name: input.name }).where(eq(Users.id, ctx.session.userId));
  }),
});
