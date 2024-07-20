import { redirect } from '@sveltejs/kit';
import { trpcS } from '$lib/trpc';

export const load = async (event) => {
  const isAuthenticated = await trpcS(event).auth.isAuthenticated.query();
  if (!isAuthenticated) {
    redirect(302, '/auth/login');
  }
};
