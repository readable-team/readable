import { definePreset } from '@pandacss/dev';
import { breakpoints } from './breakpoints';
import { conditions } from './conditions';
import { globalCss, globalFontface } from './global';
import { semanticTokens } from './semantic-tokens';
import { tokens } from './tokens';
import { utilities } from './utilities';

export * as hooks from './hooks';

export const preset = definePreset({
  presets: ['@pandacss/preset-base'],

  theme: {
    breakpoints,
    tokens,
    semanticTokens,
  },

  conditions,
  utilities,

  globalCss,
  globalFontface,
});
