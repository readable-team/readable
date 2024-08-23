import '@readable/lib/dayjs';

import { logging } from '@readable/lib/svelte';
import { sequence } from '@sveltejs/kit/hooks';

export const handle = sequence(logging);
