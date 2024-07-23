import { redirect } from '@sveltejs/kit';
import { trpc } from '$lib/trpc.js';

export const load = async ({ parent }) => {
  await parent();

  const workspaces = await trpc.workspace.list.query();
  redirect(302, `/workspace/${workspaces[0].id}`);
};
