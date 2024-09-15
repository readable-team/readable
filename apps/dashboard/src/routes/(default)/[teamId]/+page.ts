import type { TeamPage_Query_Variables } from './$graphql';

export const _TeamPage_Query_Variables: TeamPage_Query_Variables = async ({ params }) => ({
  teamId: params.teamId,
});
