import type { PagePage_Query_Variables } from './$graphql';

export const _PagePage_Query_Variables: PagePage_Query_Variables = ({ params }) => ({
  siteId: params.siteId,
  pageId: params.pageId,
});
