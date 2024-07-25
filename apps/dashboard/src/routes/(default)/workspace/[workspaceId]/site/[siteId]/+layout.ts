import { trpc } from '$lib/trpc.js';

export const load = async ({ params }) => {
  const site = await trpc.site.get.query({
    siteId: params.siteId,
  });

  return {
    usersiteUrl: site.usersiteUrl,
    siteId: params.siteId,
  };
};
