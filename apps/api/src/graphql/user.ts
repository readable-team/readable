import { and, asc, eq, getTableColumns } from 'drizzle-orm';
import { builder } from '@/builder';
import { db, firstOrThrow, Users, UserSessions, UserSingleSignOns, WorkspaceMembers, Workspaces } from '@/db';
import { UserState, WorkspaceState } from '@/enums';
import { ApiError } from '@/errors';
import { dataSchemas } from '@/schemas';
import { User, Workspace } from './objects';

/**
 * * Types
 */

User.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    email: t.exposeString('email'),
    avatarUrl: t.exposeString('avatarUrl'),

    workspaces: t.field({
      type: [Workspace],
      resolve: async (user) => {
        return await db
          .select(getTableColumns(Workspaces))
          .from(Workspaces)
          .innerJoin(WorkspaceMembers, eq(Workspaces.id, WorkspaceMembers.workspaceId))
          .where(and(eq(WorkspaceMembers.userId, user.id), eq(Workspaces.state, WorkspaceState.ACTIVE)))
          .orderBy(asc(WorkspaceMembers.createdAt));
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
      avatarUrl: t.input.string({ validate: { schema: dataSchemas.blob.url } }),
    },
    resolve: async (_, { input }, ctx) => {
      return await db
        .update(Users)
        .set({ name: input.name, avatarUrl: input.avatarUrl })
        .where(eq(Users.id, ctx.session.userId))
        .returning()
        .then(firstOrThrow);
    },
  }),

  deactivateUser: t.withAuth({ session: true }).field({
    type: User,
    resolve: async (_, __, ctx) => {
      const members = await db
        .select({ id: WorkspaceMembers.id })
        .from(WorkspaceMembers)
        .innerJoin(Workspaces, eq(WorkspaceMembers.workspaceId, Workspaces.id))
        .where(and(eq(WorkspaceMembers.userId, ctx.session.userId), eq(Workspaces.state, WorkspaceState.ACTIVE)));

      if (members.length > 0) {
        throw new ApiError({ code: 'user_has_workspaces' });
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
