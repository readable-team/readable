import { logging } from '@readable/lib/svelte';
import * as Sentry from '@sentry/sveltekit';
import { sequence } from '@sveltejs/kit/hooks';

export const handle = sequence(Sentry.sentryHandle(), logging);

export { handleError } from './common';
