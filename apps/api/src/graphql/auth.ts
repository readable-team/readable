import dayjs from 'dayjs';
import { and, eq, gt } from 'drizzle-orm';
import ky from 'ky';
import { match } from 'ts-pattern';
import { builder } from '@/builder';
import {
  db,
  first,
  firstOrThrow,
  Images,
  TeamMemberInvitations,
  TeamMembers,
  Users,
  UserSessions,
  UserSingleSignOns,
} from '@/db';
import { SingleSignOnProvider, TeamMemberRole, UserState } from '@/enums';
import { ReadableError } from '@/errors';
import * as google from '@/external/google';
import { createAccessToken } from '@/utils/access-token';
import { getTeamPlanRule } from '@/utils/plan';
import { persistBlobAsImage } from '@/utils/user-contents';
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
    input: {
      provider: t.input.field({ type: SingleSignOnProvider }),
      email: t.input.field({ type: 'String', required: false }),
    },
    resolve: async (_, { input }) => {
      return match(input.provider)
        .with(SingleSignOnProvider.GOOGLE, () => google.generateAuthorizationUrl(input.email ?? undefined))
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
        throw new ReadableError({ code: 'user_email_exists' });
      }

      const user = await db.transaction(async (tx) => {
        const avatarBlob = await ky(externalUser.avatarUrl).then((res) => res.blob());
        const avatar = await persistBlobAsImage({ file: new File([avatarBlob], externalUser.avatarUrl) });

        const user = await tx
          .insert(Users)
          .values({
            email: externalUser.email,
            name: externalUser.name,
            avatarId: avatar.id,
          })
          .returning({ id: Users.id })
          .then(firstOrThrow);

        await tx.update(Images).set({ userId: user.id }).where(eq(Images.id, avatar.id));

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

        for (const teamId of teamIds) {
          const memberRole = await getTeamPlanRule({
            teamId,
            rule: 'memberRole',
          });

          await tx.insert(TeamMembers).values({
            teamId,
            userId: user.id,
            role: memberRole ? TeamMemberRole.MEMBER : TeamMemberRole.ADMIN,
          });
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
