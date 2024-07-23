import { redirect } from '@sveltejs/kit';

export const load = ({ params }) => {
  redirect(302, `/workspace/${params.workspaceId}/site/${params.siteId}/pages`);
};
