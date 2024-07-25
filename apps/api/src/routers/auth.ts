import path from 'node:path';
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
import { SingleSignOnProvider, WorkspaceMemberRole } from '@/enums';
import * as aws from '@/external/aws';
import * as google from '@/external/google';
import { publicProcedure, router, sessionProcedure } from '@/trpc';
import { createAccessToken } from '@/utils/access-token';

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

      let user = await db.select({ id: Users.id }).from(Users).where(eq(Users.email, externalUser.email)).then(first);

      if (!user) {
        user = await db.transaction(async (tx) => {
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
            principal: externalUser.id,
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
      }

      const session = await db
        .insert(UserSessions)
        .values({ userId: user.id })
        .returning({ id: UserSessions.id })
        .then(firstOrThrow);

      const accessToken = await createAccessToken(session.id);

      return {
        accessToken,
      };
    }),

  logout: sessionProcedure.mutation(async ({ ctx }) => {
    await db.delete(UserSessions).where(eq(UserSessions.id, ctx.session.id));
  }),
});
