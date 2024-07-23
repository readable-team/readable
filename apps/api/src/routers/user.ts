import { eq } from 'drizzle-orm';
import { db, firstOrThrow, Users } from '@/db';
import { inputSchemas } from '@/schemas';
import { router, sessionProcedure } from '@/trpc';

export const userRouter = router({
  me: sessionProcedure.query(async ({ ctx }) => {
    return await db
      .select({ id: Users.id, email: Users.email, name: Users.name, avatarId: Users.avatarId })
      .from(Users)
      .where(eq(Users.id, ctx.session.userId))
      .then(firstOrThrow);
  }),

  updateProfile: sessionProcedure.input(inputSchemas.user.updateProfile).mutation(async ({ input, ctx }) => {
    await db.update(Users).set({ name: input.name }).where(eq(Users.id, ctx.session.userId));
  }),
});
