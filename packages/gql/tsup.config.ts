import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    vite: 'src/vite/index.ts',
  },
  format: ['esm'],
  external: [/^\$/],
});
