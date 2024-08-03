import type { SitePage_Query_Variables } from './$graphql';

export const _SitePage_Query_Variables: SitePage_Query_Variables = ({ params }) => ({
  slug: params.site,
});
