import { svelte } from '@sveltejs/vite-plugin-svelte';
import { sveltePreprocess } from 'svelte-preprocess';
import icons from 'unplugin-icons/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [svelte({ preprocess: sveltePreprocess() }), icons()],
  build: {
    target: 'es2015',
    lib: {
      name: 'Readable',
      entry: './src/script.ts',
      fileName: () => 'script.js',
      formats: ['umd'],
    },
  },
});
