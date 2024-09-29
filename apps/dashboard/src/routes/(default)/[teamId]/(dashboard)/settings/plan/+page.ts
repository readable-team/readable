import type { TeamSettingsPlanPage_Query_Variables } from './$graphql';

export const _TeamSettingsPlanPage_Query_Variables: TeamSettingsPlanPage_Query_Variables = async ({ params }) => ({
  teamId: params.teamId,
});
