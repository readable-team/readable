import path from 'node:path';
import cookie from 'cookie';
import dayjs from 'dayjs';
import { and, eq, gt } from 'drizzle-orm';
import { match } from 'ts-pattern';
import { builder } from '@/builder';
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
import { env } from '@/env';
import { ApiError } from '@/errors';
import * as aws from '@/external/aws';
import * as google from '@/external/google';
import { createAccessToken } from '@/utils/access-token';
import { User } from './objects';
import type { Context } from '@/context';

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
    type: User,
    input: { provider: t.input.field({ type: SingleSignOnProvider }), params: t.input.field({ type: 'JSON' }) },
    resolve: async (_, { input }, ctx) => {
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
        await createSessionAndSetCookie(ctx, sso.userId);

        return sso.userId;
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

        const workspaceIds = new Set(invitations.map((invitation) => invitation.workspaceId));

        if (workspaceIds.size > 0) {
          await tx.insert(WorkspaceMembers).values(
            [...workspaceIds].map((workspaceId) => ({
              workspaceId,
              userId: user.id,
              role: WorkspaceMemberRole.MEMBER,
            })),
          );
        }

        return user;
      });

      await createSessionAndSetCookie(ctx, user.id);

      return user.id;
    },
  }),

  logout: t.withAuth({ session: true }).field({
    type: 'Boolean',
    resolve: async (_, __, ctx) => {
      await db.delete(UserSessions).where(eq(UserSessions.id, ctx.session.id));

      ctx.resHeaders.set(
        'Set-Cookie',
        cookie.serialize('rdbl-at', '', {
          expires: new Date(0),
          path: '/',
        }),
      );

      return true;
    },
  }),
}));

/*
 * * Utils
 */

const createSessionAndSetCookie = async (ctx: Context, userId: string) => {
  const session = await db
    .insert(UserSessions)
    .values({ userId })
    .returning({ id: UserSessions.id })
    .then(firstOrThrow);

  const accessToken = await createAccessToken(session.id);

  ctx.resHeaders.set(
    'Set-Cookie',
    cookie.serialize('rdbl-at', accessToken, {
      expires: dayjs().add(1, 'year').toDate(),
      domain: new URL(env.DASHBOARD_URL).hostname,
      path: '/',
      sameSite: 'none',
      secure: true,
      httpOnly: true,
    }),
  );
};
