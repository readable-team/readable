import type { IndexPage_Query_Variables } from './$graphql';

export const _IndexPage_Query_Variables: IndexPage_Query_Variables = ({ url, data }) => ({
  hostname: data.hostnameOverride ?? url.hostname,
});
