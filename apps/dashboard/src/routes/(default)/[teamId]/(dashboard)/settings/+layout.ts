import type { TeamSettingsLayout_Query_Variables } from './$graphql';

export const _TeamSettingsLayout_Query_Variables: TeamSettingsLayout_Query_Variables = async ({ params }) => ({
  teamId: params.teamId,
});
