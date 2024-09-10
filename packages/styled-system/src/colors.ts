import { defineSemanticTokens, defineTokens } from '@pandacss/dev';

export const colors = defineTokens.colors({
  current: { value: 'currentColor' },

  transparent: { value: 'rgb(0 0 0 / 0)' },

  gray: {
    '100': { value: '#fafafa' },
    '200': { value: '#f4f4f5' },
    '300': { value: '#e4e4e7' },
    '400': { value: '#d4d4d8' },
    '500': { value: '#a1a1aa' },
    '600': { value: '#71717a' },
    '700': { value: '#52525b' },
    '800': { value: '#3f3f46' },
    '900': { value: '#27272a' },
    '1000': { value: '#09090b' },
  },
  darkgray: {
    '100': { value: '#fafafa' },
    '200': { value: '#f4f4f5' },
    '300': { value: '#e4e4e7' },
    '400': { value: '#d4d4d8' },
    '500': { value: '#a1a1aa' },
    '600': { value: '#71717a' },
    '700': { value: '#52525b' },
    '800': { value: '#3f3f46' },
    '900': { value: '#27272a' },
    '1000': { value: '#09090B' },
  },
  brand: {
    '100': { value: '#feeee5' },
    '200': { value: '#fedbc6' },
    '300': { value: '#ffc09c' },
    '400': { value: '#ff9c63' },
    '500': { value: '#ff7b2e' },
    '600': { value: '#ff5e00' },
    '700': { value: '#cc4b00' },
    '800': { value: '#5c2200' },
    '900': { value: '#2e1100' },
  },
  red: {
    '100': { value: '#fff7f7' },
    '200': { value: '#fed5d5' },
    '300': { value: '#ffb5b5' },
    '400': { value: '#ff8c8c' },
    '500': { value: '#ff4242' },
    '600': { value: '#e52222' },
    '700': { value: '#b20c0c' },
    '800': { value: '#750404' },
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
    tertiary: { value: { base: '{colors.gray.600}', _dark: '{colors.darkgray.400}' } },
    danger: { value: { base: '{colors.red.600}', _dark: '{colors.red.500}' } },
    disabled: { value: { base: '{colors.gray.500}', _dark: '{colors.darkgray.600}' } },
  },
  divider: {
    primary: { value: { base: '{colors.gray.200}', _dark: '{colors.darkgray.900}' } },
    secondary: { value: { base: '{colors.gray.300/60}', _dark: '{colors.darkgray.800/60}' } },
  },
  border: {
    image: { value: { base: '{colors.gray.400/60}', _dark: '{colors.darkgray.800/60}' } },
    primary: { value: { base: '{colors.gray.200}', _dark: '{colors.darkgray.900}' } },
    secondary: { value: { base: '{colors.gray.300/60}', _dark: '{colors.darkgray.800/60}' } },
  },
  surface: {
    primary: { value: { base: '{colors.white}', _dark: '{colors.darkgray.1000}' } },
    secondary: { value: { base: '{colors.gray.100}', _dark: '{colors.darkgray.900}' } },
    tertiary: { value: { base: '{colors.gray.200}', _dark: '{colors.darkgray.800}' } },
  },
  background: {
    overlay: { value: { base: '{colors.white}', _dark: '{colors.darkgray.800}' } },
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
});
