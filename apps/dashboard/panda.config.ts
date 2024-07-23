import { defineConfig } from '@pandacss/dev';
import { hooks, preset } from '@readable/styled-system';

const prod = process.env.NODE_ENV === 'production';

export default defineConfig({
  importMap: '@readable/styled-system',
  include: ['./src/**/*.{js,ts,svelte}', '../../packages/ui/src/**/*.{js,ts,svelte}'],

  eject: true,
  presets: [preset],

  separator: '-',
  hash: prod,
  minify: prod,

  hooks: prod
    ? {
        'cssgen:done': ({ artifact, content }) => {
          if (artifact === 'styles.css') {
            return hooks.removeUnusedCssVars(content);
          }
        },
      }
    : undefined,
});
