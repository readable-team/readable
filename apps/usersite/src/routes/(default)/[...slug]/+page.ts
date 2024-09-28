import type { PagePage_Query_Variables } from './$graphql';

export const _PagePage_Query_Variables: PagePage_Query_Variables = async ({ params }) => {
  return { path: params.slug };
};

export const _PagePage_Query_Extensions = { cache: true };
