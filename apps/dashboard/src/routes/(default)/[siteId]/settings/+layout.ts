import type { LayoutLoad } from './$types';

export const load: LayoutLoad = ({ params }) => {
  return {
    props: {
      siteId: params.siteId,
    },
  };
};
