import { defineSemanticTokens, defineTokens } from '@pandacss/dev';

export const colors = defineTokens.colors({
  current: { value: 'currentColor' },

  transparent: { value: 'rgb(0 0 0 / 0)' },

  gray: {
    '100': { value: '#f4f4f5' },
    '200': { value: '#ecedee' },
    '300': { value: '#e2e3e5' },
    '400': { value: '#d1d3d7' },
    '500': { value: '#a9acb1' },
    '600': { value: '#8f9298' },
    '700': { value: '#6f7379' },
    '800': { value: '#50545a' },
    '900': { value: '#424548' },
    '1000': { value: '#191b1c' },
  },
  darkgray: {
    '100': { value: '#eff0f0' },
    '200': { value: '#d8dbdd' },
    '300': { value: '#93999f' },
    '400': { value: '#878c92' },
    '500': { value: '#767a7f' },
    '600': { value: '#595d60' },
    '700': { value: '#3f4245' },
    '800': { value: '#333638' },
    '900': { value: '#2a2c2e' },
    '1000': { value: '#191b1c' },
  },
  brand: {
    '100': { value: '#ecfbf9' },
    '200': { value: '#c9f0eb' },
    '300': { value: '#9ce2d9' },
    '400': { value: '#6ed4c7' },
    '500': { value: '#41c6b5' },
    '600': { value: '#14b8a4' },
    '700': { value: '#109382' },
    '800': { value: '#0c6e62' },
    '900': { value: '#06443c' },
  },
  red: {
    '100': { value: '#feecec' },
    '200': { value: '#fed5d5' },
    '300': { value: '#ffb5b5' },
    '400': { value: '#ff8c8c' },
    '500': { value: '#ff6363' },
    '600': { value: '#ff4242' },
    '700': { value: '#e52222' },
    '800': { value: '#880808' },
    '900': { value: '#3b0101' },
  },
  white: { value: '#ffffff' },
});

export const semanticColors = defineSemanticTokens.colors({
  /**
   * Common
   */
  text: {
    accent: { value: { base: '{colors.brand.600}', _dark: '{colors.brand.500}' } },
    primary: { value: { base: '{colors.gray.1000}', _dark: '{colors.darkgray.100}' } },
    secondary: { value: { base: '{colors.gray.700}', _dark: '{colors.darkgray.300}' } },
    tertiary: { value: { base: '{colors.gray.500}', _dark: '{colors.darkgray.500}' } },
    danger: { value: { base: '{colors.red.600}', _dark: '{colors.red.500}' } },
  },
  sidebar: {
    surface: { value: { base: '{colors.gray.200}', _dark: '{colors.darkgray.900}' } },
  },
  divider: {
    primary: { value: { base: '{colors.gray.200}', _dark: '{colors.darkgray.900}' } },
    secondary: { value: { base: '{colors.gray.300}', _dark: '{colors.darkgray.800}' } },
  },
  border: {
    primary: { value: { base: '{colors.gray.400/60}', _dark: '{colors.darkgray.800/60}' } },
  },
  surface: {
    primary: { value: { base: '{colors.white}', _dark: '{colors.darkgray.1000}' } },
    secondary: { value: { base: '{colors.gray.200}', _dark: '{colors.darkgray.800}' } },
  },
  link: {
    DEFAULT: { value: { base: '{colors.brand.600}', _dark: '{colors.brand.500}' } },
    hover: { value: { base: '{colors.brand.500}', _dark: '{colors.brand.300}' } },
    pressed: { value: { base: '{colors.brand.700}', _dark: '{colors.brand.600}' } },
    disabled: { value: { base: '{colors.gray.400}', _dark: '{colors.darkgray.800}' } },
  },

  /**
   * color-mode
   */
  neutral: {
    '0': { value: { base: '{colors.white}', _dark: '{colors.darkgray.1000}' } },
    '10': { value: { base: '{colors.gray.100}', _dark: '{colors.darkgray.900}' } },
    '20': { value: { base: '{colors.gray.200}', _dark: '{colors.darkgray.800}' } },
    '30': { value: { base: '{colors.gray.300}', _dark: '{colors.darkgray.700}' } },
    '40': { value: { base: '{colors.gray.400}', _dark: '{colors.darkgray.600}' } },
    '50': { value: { base: '{colors.gray.500}', _dark: '{colors.darkgray.500}' } },
    '60': { value: { base: '{colors.gray.600}', _dark: '{colors.darkgray.400}' } },
    '70': { value: { base: '{colors.gray.700}', _dark: '{colors.darkgray.300}' } },
    '80': { value: { base: '{colors.gray.800}', _dark: '{colors.darkgray.200}' } },
    '90': { value: { base: '{colors.gray.900}', _dark: '{colors.darkgray.100}' } },
    '100': { value: { base: '{colors.gray.1000}', _dark: '{colors.white}' } },
  },
  accent: {
    '10': { value: { base: '{colors.brand.100}', _dark: '{colors.brand.900}' } },
    '20': { value: { base: '{colors.brand.200}', _dark: '{colors.brand.800}' } },
    '30': { value: { base: '{colors.brand.300}', _dark: '{colors.brand.700}' } },
    '40': { value: { base: '{colors.brand.400}', _dark: '{colors.brand.600}' } },
    '50': { value: { base: '{colors.brand.500}', _dark: '{colors.brand.500}' } },
    '60': { value: { base: '{colors.brand.600}', _dark: '{colors.brand.400}' } },
    '70': { value: { base: '{colors.brand.700}', _dark: '{colors.brand.300}' } },
    '80': { value: { base: '{colors.brand.800}', _dark: '{colors.brand.200}' } },
    '90': { value: { base: '{colors.brand.900}', _dark: '{colors.brand.100}' } },
  },
  danger: {
    '10': { value: { base: '{colors.red.100}', _dark: '{colors.red.900}' } },
    '20': { value: { base: '{colors.red.200}', _dark: '{colors.red.800}' } },
    '30': { value: { base: '{colors.red.300}', _dark: '{colors.red.700}' } },
    '40': { value: { base: '{colors.red.400}', _dark: '{colors.red.600}' } },
    '50': { value: { base: '{colors.red.500}', _dark: '{colors.red.500}' } },
    '60': { value: { base: '{colors.red.600}', _dark: '{colors.red.400}' } },
    '70': { value: { base: '{colors.red.700}', _dark: '{colors.red.300}' } },
    '80': { value: { base: '{colors.red.800}', _dark: '{colors.red.200}' } },
    '90': { value: { base: '{colors.red.900}', _dark: '{colors.red.100}' } },
  },

  /**
   * Tab
   */
  tab: {
    background: {
      DEFAULT: { value: { base: '{colors.white}', _dark: '{colors.darkgray.1000}' } },
      selected: { value: { base: '{colors.white}', _dark: '{colors.darkgray.1000}' } },
      hover: { value: { base: '{colors.gray.100}', _dark: '{colors.darkgray.900}' } },
    },
    foreground: {
      DEFAULT: { value: { base: '{colors.gray.500}', _dark: '{colors.darkgray.600}' } },
      selected: { value: { base: '{colors.gray.1000}', _dark: '{colors.darkgray.100}' } },
      hover: { value: { base: '{colors.gray.1000}', _dark: '{colors.darkgray.100}' } },
    },
    border: {
      DEFAULT: { value: { base: '{colors.transparent}', _dark: '{colors.transparent}' } },
      selected: { value: { base: '{colors.gray.1000}', _dark: '{colors.darkgray.100}' } },
      hover: { value: { base: '{colors.transparent}', _dark: '{colors.transparent}' } },
    },
  },
});
