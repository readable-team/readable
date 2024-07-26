import path from 'node:path';
import { TRPCError } from '@trpc/server';
import dayjs from 'dayjs';
import { and, eq, gt } from 'drizzle-orm';
import { match } from 'ts-pattern';
import { z } from 'zod';
import {
  db,
  first,
  firstOrThrow,
  Users,
  UserSessions,
  UserSingleSignOns,
  WorkspaceMemberInvitations,
  WorkspaceMembers,
} from '@/db';
import { SingleSignOnProvider, UserState, WorkspaceMemberRole } from '@/enums';
import * as aws from '@/external/aws';
import * as google from '@/external/google';
import { publicProcedure, router, sessionProcedure } from '@/trpc';
import { createAccessToken } from '@/utils/access-token';

const createSessionAndReturnAccessToken = async (userId: string) => {
  const session = await db
    .insert(UserSessions)
    .values({ userId })
    .returning({ id: UserSessions.id })
    .then(firstOrThrow);

  return await createAccessToken(session.id);
};

export const authRouter = router({
  isAuthenticated: publicProcedure.query(async ({ ctx }) => {
    return !!ctx.session;
  }),

  generateSingleSignOnAuthorizationUrl: publicProcedure
    .input(z.object({ provider: z.nativeEnum(SingleSignOnProvider) }))
    .mutation(({ input }) => {
      return match(input.provider)
        .with(SingleSignOnProvider.GOOGLE, () => google.generateAuthorizationUrl())
        .exhaustive();
    }),

  authorizeSingleSignOn: publicProcedure
    .input(z.object({ provider: z.nativeEnum(SingleSignOnProvider), params: z.record(z.any()) }))
    .mutation(async ({ input }) => {
      const externalUser = await match(input.provider)
        .with(SingleSignOnProvider.GOOGLE, () => google.authorizeUser(input.params.code))
        .exhaustive();

      const sso = await db
        .select({ userId: UserSingleSignOns.userId })
        .from(UserSingleSignOns)
        .where(
          and(
            eq(UserSingleSignOns.provider, externalUser.provider),
            eq(UserSingleSignOns.principal, externalUser.principal),
          ),
        )
        .then(first);

      if (sso) {
        return {
          accessToken: await createSessionAndReturnAccessToken(sso.userId),
        };
      }

      const existingUser = await db
        .select({ id: Users.id })
        .from(Users)
        .where(and(eq(Users.email, externalUser.email), eq(Users.state, UserState.ACTIVE)))
        .then(first);

      if (existingUser) {
        throw new TRPCError({ code: 'CONFLICT', message: '이미 가입되어 있는 이메일이에요' });
      }

      const user = await db.transaction(async (tx) => {
        const avatarResp = await fetch(externalUser.avatarUrl);
        const avatarBuffer = await avatarResp.arrayBuffer();

        const avatarUrl = await aws.uploadUserContents({
          filename: path.basename(externalUser.avatarUrl),
          source: Buffer.from(avatarBuffer),
        });

        const user = await tx
          .insert(Users)
          .values({
            email: externalUser.email,
            name: externalUser.name,
            avatarUrl,
          })
          .returning({ id: Users.id })
          .then(firstOrThrow);

        await tx.insert(UserSingleSignOns).values({
          userId: user.id,
          provider: externalUser.provider,
          principal: externalUser.principal,
          email: externalUser.email,
        });

        const invitations = await tx
          .delete(WorkspaceMemberInvitations)
          .where(
            and(
              eq(WorkspaceMemberInvitations.email, externalUser.email),
              gt(WorkspaceMemberInvitations.expiresAt, dayjs()),
            ),
          )
          .returning({ workspaceId: WorkspaceMemberInvitations.workspaceId });

        await tx.insert(WorkspaceMembers).values(
          invitations.map((invitation) => ({
            workspaceId: invitation.workspaceId,
            userId: user.id,
            role: WorkspaceMemberRole.MEMBER,
          })),
        );

        return user;
      });

      return {
        accessToken: await createSessionAndReturnAccessToken(user.id),
      };
    }),

  logout: sessionProcedure.mutation(async ({ ctx }) => {
    await db.delete(UserSessions).where(eq(UserSessions.id, ctx.session.id));
  }),
});
