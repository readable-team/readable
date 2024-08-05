import { and, asc, eq, getTableColumns } from 'drizzle-orm';
import { builder } from '@/builder';
import { db, firstOrThrow, TeamMembers, Teams, Users, UserSessions, UserSingleSignOns } from '@/db';
import { TeamState, UserState } from '@/enums';
import { ApiError } from '@/errors';
import { dataSchemas } from '@/schemas';
import { Image, Team, User } from './objects';

/**
 * * Types
 */

User.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    email: t.exposeString('email'),

    avatar: t.field({ type: Image, resolve: (user) => user.avatarId }),

    teams: t.field({
      type: [Team],
      resolve: async (user) => {
        return await db
          .select(getTableColumns(Teams))
          .from(Teams)
          .innerJoin(TeamMembers, eq(Teams.id, TeamMembers.teamId))
          .where(and(eq(TeamMembers.userId, user.id), eq(Teams.state, TeamState.ACTIVE)))
          .orderBy(asc(TeamMembers.createdAt));
      },
    }),
  }),
});

/**
 * * Queries
 */

builder.queryFields((t) => ({
  me: t.field({
    type: User,
    nullable: true,
    resolve: async (_, __, ctx) => {
      return ctx.session?.userId;
    },
  }),
}));

/**
 * * Mutations
 */

builder.mutationFields((t) => ({
  updateUser: t.withAuth({ session: true }).fieldWithInput({
    type: User,
    input: {
      name: t.input.string({ validate: { schema: dataSchemas.user.name } }),
      avatarId: t.input.id(),
    },
    resolve: async (_, { input }, ctx) => {
      return await db
        .update(Users)
        .set({ name: input.name, avatarId: input.avatarId })
        .where(eq(Users.id, ctx.session.userId))
        .returning()
        .then(firstOrThrow);
    },
  }),

  deactivateUser: t.withAuth({ session: true }).field({
    type: User,
    resolve: async (_, __, ctx) => {
      const members = await db
        .select({ id: TeamMembers.id })
        .from(TeamMembers)
        .innerJoin(Teams, eq(TeamMembers.teamId, Teams.id))
        .where(and(eq(TeamMembers.userId, ctx.session.userId), eq(Teams.state, TeamState.ACTIVE)));

      if (members.length > 0) {
        throw new ApiError({ code: 'user_has_teams' });
      }

      return await db.transaction(async (tx) => {
        await tx.delete(UserSessions).where(eq(UserSessions.userId, ctx.session.userId));
        await tx.delete(UserSingleSignOns).where(eq(UserSingleSignOns.userId, ctx.session.userId));

        return await tx
          .update(Users)
          .set({ state: UserState.DEACTIVATED })
          .where(eq(Users.id, ctx.session.userId))
          .returning()
          .then(firstOrThrow);
      });
    },
  }),
}));
