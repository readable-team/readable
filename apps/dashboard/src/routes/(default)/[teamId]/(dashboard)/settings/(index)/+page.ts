import type { TeamSettingsPage_Query_Variables } from './$graphql';

export const _TeamSettingsPage_Query_Variables: TeamSettingsPage_Query_Variables = async ({ params }) => ({
  teamId: params.teamId,
});
