import { definePreset } from '@pandacss/dev';
import { breakpoints } from './breakpoints';
import { conditions } from './conditions';
import { globalCss, globalFontface } from './global';
import { tokens } from './tokens';
import { utilities } from './utilities';

export * as hooks from './hooks';

export const preset = definePreset({
  presets: ['@pandacss/preset-base'],

  theme: {
    breakpoints,
    tokens,
  },

  conditions,
  utilities,

  globalCss,
  globalFontface,
});
