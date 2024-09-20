import type { TeamMembersPage_Query_Variables } from './$graphql';

export const _TeamMembersPage_Query_Variables: TeamMembersPage_Query_Variables = async ({ params }) => ({
  teamId: params.teamId,
});
