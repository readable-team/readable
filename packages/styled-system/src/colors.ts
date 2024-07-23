import { defineTokens } from '@pandacss/dev';

export const colors = defineTokens.colors({
  current: { value: 'currentColor' },

  transparent: { value: 'rgb(0 0 0 / 0)' },

  gray: {
    0: { value: '#FFFFFF' },
    50: { value: '#F5F5F5' },
    100: { value: '#EEEEEE' },
    150: { value: '#E9E9E9' },
    200: { value: '#E2E2E2' },
    300: { value: '#C7C7C7' },
    400: { value: '#9B9B9B' },
    500: { value: '#767676' },
    600: { value: '#595959' },
    800: { value: '#353535' },
    900: { value: '#171717' },
  },
});
