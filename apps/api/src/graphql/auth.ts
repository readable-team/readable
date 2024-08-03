import path from 'node:path';
import dayjs from 'dayjs';
import { and, eq, gt } from 'drizzle-orm';
import { match } from 'ts-pattern';
import { builder } from '@/builder';
import {
  db,
  first,
  firstOrThrow,
  TeamMemberInvitations,
  TeamMembers,
  Users,
  UserSessions,
  UserSingleSignOns,
} from '@/db';
import { SingleSignOnProvider, TeamMemberRole, UserState } from '@/enums';
import { ApiError } from '@/errors';
import * as aws from '@/external/aws';
import * as google from '@/external/google';
import { createAccessToken } from '@/utils/access-token';
import { User } from './objects';

/**
 * * Types
 */

const UserWithAccessToken = builder.simpleObject('UserWithAccessToken', {
  fields: (t) => ({
    user: t.field({ type: User }),
    accessToken: t.string(),
  }),
});

/**
 * * Mutations
 */

builder.mutationFields((t) => ({
  generateSingleSignOnAuthorizationUrl: t.fieldWithInput({
    type: 'String',
    input: { provider: t.input.field({ type: SingleSignOnProvider }) },
    resolve: async (_, { input }) => {
      return match(input.provider)
        .with(SingleSignOnProvider.GOOGLE, () => google.generateAuthorizationUrl())
        .exhaustive();
    },
  }),

  authorizeSingleSignOn: t.fieldWithInput({
    type: UserWithAccessToken,
    input: { provider: t.input.field({ type: SingleSignOnProvider }), params: t.input.field({ type: 'JSON' }) },
    resolve: async (_, { input }) => {
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
          user: sso.userId,
          accessToken: await createSessionAndReturnAccessToken(sso.userId),
        };
      }

      const existingUser = await db
        .select({ id: Users.id })
        .from(Users)
        .where(and(eq(Users.email, externalUser.email), eq(Users.state, UserState.ACTIVE)))
        .then(first);

      if (existingUser) {
        throw new ApiError({ code: 'user_email_exists' });
      }

      const user = await db.transaction(async (tx) => {
        const avatarResp = await fetch(externalUser.avatarUrl);
        const avatarBuffer = await avatarResp.arrayBuffer();

        const user = await tx
          .insert(Users)
          .values({
            email: externalUser.email,
            name: externalUser.name,
            avatarUrl: '',
          })
          .returning({ id: Users.id })
          .then(firstOrThrow);

        const avatarUrl = await aws.uploadUserContents({
          userId: user.id,
          filename: path.basename(externalUser.avatarUrl),
          source: Buffer.from(avatarBuffer),
        });

        await tx.update(Users).set({ avatarUrl }).where(eq(Users.id, user.id));

        await tx.insert(UserSingleSignOns).values({
          userId: user.id,
          provider: externalUser.provider,
          principal: externalUser.principal,
          email: externalUser.email,
        });

        const invitations = await tx
          .delete(TeamMemberInvitations)
          .where(and(eq(TeamMemberInvitations.email, externalUser.email), gt(TeamMemberInvitations.expiresAt, dayjs())))
          .returning({ teamId: TeamMemberInvitations.teamId });

        const teamIds = new Set(invitations.map((invitation) => invitation.teamId));

        if (teamIds.size > 0) {
          await tx.insert(TeamMembers).values(
            [...teamIds].map((teamId) => ({
              teamId,
              userId: user.id,
              role: TeamMemberRole.MEMBER,
            })),
          );
        }

        return user;
      });

      return {
        user: user.id,
        accessToken: await createSessionAndReturnAccessToken(user.id),
      };
    },
  }),

  logout: t.withAuth({ session: true }).field({
    type: 'Boolean',
    resolve: async (_, __, ctx) => {
      await db.delete(UserSessions).where(eq(UserSessions.id, ctx.session.id));

      return true;
    },
  }),
}));

/*
 * * Utils
 */

const createSessionAndReturnAccessToken = async (userId: string) => {
  const session = await db
    .insert(UserSessions)
    .values({ userId })
    .returning({ id: UserSessions.id })
    .then(firstOrThrow);

  return await createAccessToken(session.id);
};
