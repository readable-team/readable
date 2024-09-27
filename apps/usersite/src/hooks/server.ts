import { logging, sentry } from '@readable/lib/svelte';
import { sequence } from '@sveltejs/kit/hooks';

export const handle = sequence(sentry, logging);

export { handleError } from './common';
