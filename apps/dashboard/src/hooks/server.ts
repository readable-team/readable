import type { HandleFetch } from '@sveltejs/kit';

export const handleFetch: HandleFetch = async ({ event, request, fetch }) => {
  if (request.headers.has('x-use-credentials')) {
    request.headers.set('cookie', event.request.headers.get('cookie') ?? '');
    request.headers.delete('x-use-credentials');
  }

  return fetch(request);
};
