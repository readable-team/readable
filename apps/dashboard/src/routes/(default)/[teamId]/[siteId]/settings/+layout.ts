import type { LayoutLoad } from './$types';

export const load: LayoutLoad = ({ params }) => {
  return {
    props: {
      teamId: params.teamId,
      siteId: params.siteId,
    },
  };
};
