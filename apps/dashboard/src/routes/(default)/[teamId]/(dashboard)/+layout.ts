import type { TeamDashboardLayout_Query_Variables } from './$graphql';

export const _TeamDashboardLayout_Query_Variables: TeamDashboardLayout_Query_Variables = async ({ params }) => ({
  teamId: params.teamId,
});
