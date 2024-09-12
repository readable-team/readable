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
      '$graphql': '.gql',
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
        compilerOptions: {
          ...config.compilerOptions,
          rootDirs: [...config.compilerOptions.rootDirs, '../.gql/types'],
        },
        include: [...config.include, '../pulumi/**/*.ts', '../scripts/**/*.ts'],
      }),
    },
    version: { pollInterval: 60 * 1000 },
  },

  vitePlugin: {
    // see: https://github.com/sveltejs/vite-plugin-svelte/blob/main/docs/inspector.md
    inspector: true,
  },
};
