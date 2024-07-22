import { redirect } from '@sveltejs/kit';
import { trpc } from '$lib/trpc';

export const load = async () => {
  const isAuthenticated = await trpc.auth.isAuthenticated.query();
  if (!isAuthenticated) {
    redirect(302, '/auth/login');
  }

  const hasWorkspace = await trpc.workspace.hasAny.query();
  if (hasWorkspace) {
    redirect(302, '/');
  }
};
