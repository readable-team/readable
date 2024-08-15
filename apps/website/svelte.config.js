import { bun } from '@readable/adapter-bun';
import { sveltePreprocess } from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
export default {
  preprocess: sveltePreprocess(),

  kit: {
    adapter: bun(),
    alias: {
      '@/*': '../api/src/*',
      '$assets/*': './src/assets/*',
    },
    files: {
      hooks: {
        server: 'src/hooks/server',
        client: 'src/hooks/client',
      },
    },
    paths: { relative: false },
    output: { preloadStrategy: 'preload-mjs' },
    typescript: {
      config: (config) => ({
        ...config,
        include: [...config.include, '../pulumi/**/*.ts', '../scripts/**/*.ts'],
      }),
    },
    version: { pollInterval: 60 * 1000 },
  },
};
