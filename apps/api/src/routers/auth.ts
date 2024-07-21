import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { match } from 'ts-pattern';
import { z } from 'zod';
import { db, Users, UserSessions, UserSingleSignOns } from '@/db';
import { SingleSignOnProvider } from '@/enums';
import * as google from '@/external/google';
import { publicProcedure, router, sessionProcedure } from '@/trpc';
import { createAccessToken } from '@/utils/access-token';
import { uploadImage } from '@/utils/image';

export const authRouter = router({
  isAuthenticated: publicProcedure.query(async ({ ctx }) => {
    return !!ctx.session;
  }),

  generateSingleSignOnAuthorizationUrl: publicProcedure
    .input(z.object({ provider: z.nativeEnum(SingleSignOnProvider) }))
    .mutation(({ input, ctx }) => {
      const origin = ctx.req.headers.get('origin');
      if (!origin) {
        throw new TRPCError({ code: 'BAD_REQUEST' });
      }

      return match(input.provider)
        .with(SingleSignOnProvider.GOOGLE, () => google.generateAuthorizationUrl(origin))
        .exhaustive();
    }),

  authorizeSingleSignOn: publicProcedure
    .input(z.object({ provider: z.nativeEnum(SingleSignOnProvider), params: z.record(z.any()) }))
    .mutation(async ({ input, ctx }) => {
      const origin = ctx.req.headers.get('origin');
      if (!origin) {
        throw new TRPCError({ code: 'BAD_REQUEST' });
      }

      const externalUser = await match(input.provider)
        .with(SingleSignOnProvider.GOOGLE, () => google.authorizeUser(origin, input.params.code))
        .exhaustive();

      const users = await db
        .select({ id: Users.id })
        .from(Users)
        .where(eq(Users.email, externalUser.email.toLowerCase()));

      let user;
      if (users.length > 0) {
        user = users[0];
      } else {
        user = await db.transaction(async (tx) => {
          const avatarResp = await fetch(externalUser.avatarUrl);
          const avatarBuffer = await avatarResp.arrayBuffer();

          const avatarId = await uploadImage({
            tx,
            name: 'avatar',
            source: avatarBuffer,
          });

          const [user] = await tx
            .insert(Users)
            .values({
              email: externalUser.email.toLowerCase(),
              name: externalUser.name,
              avatarId,
            })
            .returning({ id: Users.id });

          await tx.insert(UserSingleSignOns).values({
            userId: user.id,
            provider: externalUser.provider,
            principal: externalUser.id,
            email: externalUser.email.toLowerCase(),
          });

          return user;
        });
      }

      const [session] = await db.insert(UserSessions).values({ userId: user.id }).returning({ id: UserSessions.id });
      const accessToken = await createAccessToken(session.id);

      return {
        accessToken,
      };
    }),

  logout: sessionProcedure.mutation(async ({ ctx }) => {
    await db.delete(UserSessions).where(eq(UserSessions.id, ctx.session.id));
  }),
});
