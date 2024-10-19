import path from 'node:path';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import icons from 'unplugin-icons/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [svelte(), icons()],
  resolve: {
    alias: {
      '$styled-system': path.resolve(import.meta.dirname, './styled-system'),
    },
  },
  build: {
    target: 'es2015',
    lib: {
      entry: './src/script.ts',
      fileName: 'script',
      formats: ['es'],
    },
  },
});
