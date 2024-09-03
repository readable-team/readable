import type { KoLayout_Query_Variables } from './$graphql';

export const _KoLayout_Query_Variables: KoLayout_Query_Variables = async ({ parent }) => {
  const { hostname } = await parent();

  return {
    hostname,
  };
};
