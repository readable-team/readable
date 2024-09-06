import { svg } from '@readable/lib/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [svg(), sveltekit()],
});
