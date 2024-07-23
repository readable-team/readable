import { defineSemanticTokens, defineTokens } from '@pandacss/dev';

export const colors = defineTokens.colors({
  current: { value: 'currentColor' },

  transparent: { value: 'rgb(0 0 0 / 0)' },

  gray: {
    0: { value: '#FFFFFF' },
    20: { value: '#F5F5F6' },
    50: { value: '#EAEBEC' },
    150: { value: '#E1E2E4' },
    200: { value: '#DBDCDF' },
    250: { value: '#C2C4C8' },
    300: { value: '#AEB0B6' },
    350: { value: '#989BA2' },
    400: { value: '#878A93' },
    450: { value: '#70737C' },
    500: { value: '#46474C' },
    550: { value: '#37383C' },
    600: { value: '#35363B' },
    650: { value: '#2E2F33' },
    700: { value: '#292A2D' },
    750: { value: '#212225' },
    800: { value: '#1B1C1E' },
    900: { value: '#171719' },
    950: { value: '#0F0F10' },
  },

  primary: {
    50: { value: '#FFFAF7' },
    100: { value: '#FEEEE5' },
    200: { value: '#FEDBC6' },
    300: { value: '#FFC09C' },
    400: { value: '#FF9C63' },
    500: { value: '#FF7B2E' },
    600: { value: '#FF5E00' },
    700: { value: '#E24400' },
    800: { value: '#943600' },
    900: { value: '#5C2200' },
  },

  red: {
    50: { value: '#FFFAFA' },
    100: { value: '#FEECEC' },
    200: { value: '#FED5D5' },
    300: { value: '#FFB5B5' },
    400: { value: '#FF8C8C' },
    500: { value: '#FF6363' },
    600: { value: '#FF2F2F' },
    700: { value: '#E52222' },
    800: { value: '#B20C0C' },
    900: { value: '#750404' },
  },
});

export const semanticColors = defineSemanticTokens.colors({
  text: {
    main1: { value: { base: '{colors.gray.0}', _dark: '{colors.gray.700}' } },
    main2: { value: { base: '{colors.gray.150}', _dark: '{colors.gray.500}' } },
    main3: { value: { base: '{colors.gray.200}', _dark: '{colors.gray.550}' } },
    main4: { value: { base: '{colors.gray.300}', _dark: '{colors.gray.600}' } },
    main5: { value: { base: '{colors.gray.450}', _dark: '{colors.gray.500}' } },
    main6: { value: { base: '{colors.gray.950}', _dark: '{colors.gray.0}' } },

    primary: { value: { base: '{colors.primary.600}', _dark: '{colors.primary.500}' } },
    danger: {
      default: { value: { base: '{colors.red.600}', _dark: '{colors.red.500}' } },
      hover: { value: { base: '{colors.red.400}', _dark: '{colors.red.700}' } },
      pressed: { value: { base: '{colors.red.800}', _dark: '{colors.red.400}' } },
    },

    button: {
      main: {
        primary: { value: { base: '{colors.primary.600}', _dark: '{colors.primary.500}' } },
        hover: { value: { base: '{colors.primary.400}', _dark: '{colors.primary.700}' } },
        pressed: { value: { base: '{colors.primary.700}', _dark: '{colors.primary.600}' } },
      },
      outline: {
        primary: { value: { base: 'colors.gray.450', _dark: '{colors.gray.500}' } },
        hover: { value: { base: '{colors.gray.300}', _dark: '{colors.gray.600}' } },
        pressed: { value: { base: '{colors.gray.550}', _dark: '{colors.gray.450}' } },
      },
    },

    link: {
      default: { value: { base: '{colors.primary.600}', _dark: '{colors.primary.500}' } },
      hover: { value: { base: '{colors.primary.400}', _dark: '{colors.primary.700}' } },
      pressed: { value: { base: '{colors.primary.700}', _dark: '{colors.primary.600}' } },
    },
  },

  surface: {
    main: { value: { base: '{colors.gray.0}', _dark: '{colors.gray.950}' } },
    sub: { value: { base: '{colors.gray.50}', _dark: '{colors.gray.750}' } },
    hover: { value: { base: '{colors.gray.200}', _dark: '{colors.gray.550}' } },
    pressed: { value: { base: '{colors.gray.200}', _dark: '{colors.gray.550}' } },
    disabled: { value: { base: '{colors.gray.150}', _dark: '{colors.gray.500}' } },
    danger: { value: { base: '{colors.red.100}', _dark: '{colors.red.700}' } },

    primary: {
      default: { value: { base: '{colors.primary.600}', _dark: '{colors.primary.500}' } },
      hover: { value: { base: '{colors.primary.400}', _dark: '{colors.primary.700}' } },
      pressed: { value: { base: '{colors.primary.700}', _dark: '{colors.primary.600}' } },
      selected: { value: { base: '{colors.primary.100}', _dark: '{colors.primary.700}' } },
    },
  },

  border: {
    main: { value: { base: '{colors.gray.20}', _dark: '{colors.gray.900}' } },
    sub1: { value: { base: '{colors.gray.50}', _dark: '{colors.gray.750}' } },
    sub2: { value: { base: '{colors.gray.150}', _dark: '{colors.gray.650}' } },
    hover: { value: { base: '{colors.gray.200}', _dark: '{colors.gray.550}' } },
    pressed: { value: { base: '{colors.gray.200}', _dark: '{colors.gray.550}' } },
    disabled: { value: { base: '{colors.gray.150}', _dark: '{colors.gray.500}' } },

    button: { value: { base: '{colors.gray.0}', _dark: '{colors.gray.950}' } },
    danger: { value: { base: '{colors.red.600}', _dark: '{colors.red.500}' } },

    primary: {
      default: { value: { base: '{colors.primary.600}', _dark: '{colors.primary.500}' } },
      hover: { value: { base: '{colors.primary.400}', _dark: '{colors.primary.700}' } },
      pressed: { value: { base: '{colors.primary.700}', _dark: '{colors.primary.600}' } },
    },
  },
});
