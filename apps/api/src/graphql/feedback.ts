import { and, eq } from 'drizzle-orm';
import { builder } from '@/builder';
import { db, firstOrThrow, TeamMembers, Teams, Users } from '@/db';
import { logToSlack } from '@/utils/slack';

builder.mutationFields((t) => ({
  createFeedback: t.withAuth({ session: true }).fieldWithInput({
    type: 'Boolean',
    input: {
      content: t.input.string(),
      teamId: t.input.string(),
    },
    resolve: async (_, { input }, ctx) => {
      const user = await db
        .select({
          id: Users.id,
          name: Users.name,
          teamId: Teams.id,
          teamName: Teams.name,
        })
        .from(Users)
        .innerJoin(TeamMembers, and(eq(TeamMembers.userId, Users.id), eq(TeamMembers.teamId, input.teamId)))
        .innerJoin(Teams, eq(Teams.id, TeamMembers.teamId))
        .where(eq(Users.id, ctx.session.userId))
        .then(firstOrThrow);

      logToSlack('feedback', {
        content: `사용자: ${user.name} (${user.id})
팀: ${user.teamName} (${user.teamId})
내용: ${input.content}`,
      });

      return true;
    },
  }),
}));
