import type { SitePagesPage_Query_Variables } from './$graphql';

export const _SitePagesPage_Query_Variables: SitePagesPage_Query_Variables = ({ params }) => ({
  workspaceId: params.workspaceId,
  siteId: params.siteId,
});
