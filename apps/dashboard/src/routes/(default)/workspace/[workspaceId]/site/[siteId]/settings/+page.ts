import { redirect } from '@sveltejs/kit';

export function load() {
  return redirect(302, '/workspace/foo/site/bar/settings/general');
}
