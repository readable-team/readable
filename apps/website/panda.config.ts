import { defineConfig } from '@pandacss/dev';
import { preset } from '@readable/styled-system';

const prod = process.env.NODE_ENV === 'production';

export default defineConfig({
  importMap: '@readable/styled-system',
  include: ['./src/**/*.{js,ts,svelte}', '../../packages/ui/src/**/*.{js,ts,svelte}'],

  eject: true,
  presets: [preset],

  separator: '-',
  hash: prod,
  minify: prod,

  theme: {
    extend: {
      keyframes: {
        scrollCardsLeftLg: {
          '0%': {
            transform: 'translateX(0)',
          },
          '100%': {
            transform: 'translateX(calc(-312px * 5))',
          },
        },
        scrollCardsRightLg: {
          '0%': {
            transform: 'translateX(calc(-312px * 5))',
          },
          '100%': {
            transform: 'translateX(0)',
          },
        },
        scrollCardsLeft: {
          '0%': {
            transform: 'translateX(0)',
          },
          '100%': {
            transform: 'translateX(calc(-234px * 5))',
          },
        },
        scrollCardsRight: {
          '0%': {
            transform: 'translateX(calc(-234px * 5))',
          },
          '100%': {
            transform: 'translateX(0)',
          },
        },
      },
    },
  },
});
