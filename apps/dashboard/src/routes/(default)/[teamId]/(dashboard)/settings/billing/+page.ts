import type { TeamSettingsBillingPage_Query_Variables } from './$graphql';

export const _TeamSettingsBillingPage_Query_Variables: TeamSettingsBillingPage_Query_Variables = async ({
  params,
}) => ({
  teamId: params.teamId,
});
