import type { SiteLayout_Query_Variables } from './$graphql';

export const _SiteLayout_Query_Variables: SiteLayout_Query_Variables = ({ params }) => ({
  workspaceId: params.workspaceId,
  siteId: params.siteId,
});
