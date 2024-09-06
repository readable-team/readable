import { gql } from '@readable/gql/vite';
import { svg } from '@readable/lib/vite';
import { readableIcons } from '@readable/ui/icons';
import { sveltekit } from '@sveltejs/kit/vite';
import icons from 'unplugin-icons/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    icons({
      scale: 1,
      compiler: 'svelte',
      customCollections: {
        rdbl: readableIcons,
      },
    }),
    gql(),
    svg(),
    sveltekit(),
  ],
  server: {
    port: 4200,
    strictPort: true,
  },
});
