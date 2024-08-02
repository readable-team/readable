import type { DefaultLayout_Query_Variables } from './$graphql';

export const _DefaultLayout_Query_Variables: DefaultLayout_Query_Variables = ({ url, data }) => ({
  hostname: data.hostnameOverride ?? url.hostname,
});
