import { bun } from '@readable/adapter-bun';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
export default {
  preprocess: vitePreprocess(),

  kit: {
    adapter: bun(),
    alias: {
      '@/*': '../api/src/*',
    },
    files: {
      hooks: {
        server: 'src/hooks/server',
        client: 'src/hooks/client',
      },
    },
  },
};
