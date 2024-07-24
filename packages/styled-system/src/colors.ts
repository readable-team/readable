import { defineSemanticTokens, defineTokens } from '@pandacss/dev';

export const colors = defineTokens.colors({
  current: { value: 'currentColor' },

  transparent: { value: 'rgb(0 0 0 / 0)' },

  gray: {
    '0': { value: '#FFFFFF' },
    '100': { value: '#F7F7F8' },
    '200': { value: '#F2F2F3' },
    '300': { value: '#EBEBEB' },
    '400': { value: '#DEEDE2' },
    '500': { value: '#B8B8BF' },
    '600': { value: '#8E9299' },
    '700': { value: '#6B717D' },
    '800': { value: '#4F5764' },
    '1000': { value: '#202122' },
  },
  darkgray: {
    '0': { value: '#202122' },
    '100': { value: '#252728' },
    '200': { value: '#2C2E2F' },
    '300': { value: '#303336' },
    '350': { value: '#3D4145' },
    '400': { value: '#4B4F53' },
    '500': { value: '#61666B' },
    '600': { value: '#7D848C' },
    '700': { value: '#949BA3' },
    '800': { value: '#A5ADB6' },
    '900': { value: '#BBC2CA' },
    '950': { value: '#CBD1D7' },
    '1000': { value: '#F5F5F5' },
  },
  brand: {
    '100': { value: '#FEF4E6' },
    '200': { value: '#FEE6C6' },
    '300': { value: '#FFD49C' },
    '400': { value: '#FFC06E' },
    '500': { value: '#FFA938' },
    '600': { value: '#FF9200' },
    '700': { value: '#D47800' },
    '800': { value: '#9C5800' },
  },
  red: {
    '100': { value: '#FEECEC' },
    '200': { value: '#FED5D5' },
    '300': { value: '#FFB5B5' },
    '400': { value: '#FF8C8C' },
    '500': { value: '#FF6363' },
    '600': { value: '#FF4242' },
    '700': { value: '#E52222' },
    '800': { value: '#880808' },
    '900': { value: '#3B0101' },
  },
});

export const semanticColors = defineSemanticTokens.colors({
  /**
   * Common
   */
  'sidebar': {
    surface: { value: { base: '{colors.gray.200}', _dark: '{colors.darkgray.350}' } },
  },
  'divider': {
    primary: { value: { base: '{colors.gray.200}', _dark: '{colors.darkgray.300}' } },
  },
  'text': {
    accent: { value: { base: '{colors.brand.600}', _dark: '{colors.brand.500}' } },
    primary: { value: { base: '{colors.gray.1000}', _dark: '{colors.darkgray.1000}' } },
    secondary: { value: { base: '{colors.gray.600}', _dark: '{colors.darkgray.600}' } },
    tertiary: { value: { base: '{colors.gray.500}', _dark: '{colors.darkgray.500}' } },
    danger: { value: { base: '{colors.red.600}', _dark: '{colors.red.500}' } },
  },
  'link': {
    DEFAULT: { value: { base: '{colors.brand.600}', _dark: '{colors.brand.500}' } },
    hover: { value: { base: '{colors.brand.500}', _dark: '{colors.brand.300}' } },
    pressed: { value: { base: '{colors.brand.700}', _dark: '{colors.brand.600}' } },
    disabled: { value: { base: '{colors.gray.400}', _dark: '{colors.darkgray.350}' } },
  },
  'surface': {
    primary: { value: { base: '{colors.gray.0}', _dark: '{colors.darkgray.0}' } },
    secondary: { value: { base: '{colors.gray.200}', _dark: '{colors.darkgray.300}' } },
  },

  /**
   * Button
   */
  'button': {
    background: {
      'primary': { value: { base: '{colors.brand.600}', _dark: '{colors.brand.500}' } },
      'primary-hover': { value: { base: '{colors.brand.500}', _dark: '{colors.brand.300}' } },
      'primary-pressed': { value: { base: '{colors.brand.700}', _dark: '{colors.brand.600}' } },
      'primary-disabled': { value: { base: '{colors.gray.200}', _dark: '{colors.darkgray.350}' } },
      'secondary': { value: { base: '{colors.gray.0}', _dark: '{colors.darkgray.1000}' } },
      'secondary-hover': { value: { base: '{colors.gray.100}', _dark: '{colors.darkgray.950}' } },
      'secondary-pressed': { value: { base: '{colors.gray.300}', _dark: '{colors.darkgray.800}' } },
      'secondary-disabled': { value: { base: '{colors.gray.200}', _dark: '{colors.darkgray.350}' } },
      'danger': { value: { base: '{colors.red.600}', _dark: '{colors.red.500}' } },
      'danger-hover': { value: { base: '{colors.red.500}', _dark: '{colors.red.300}' } },
      'danger-pressed': { value: { base: '{colors.red.700}', _dark: '{colors.red.600}' } },
      'danger-disabled': { value: { base: '{colors.gray.200}', _dark: '{colors.darkgray.350}' } },
    },
    foreground: {
      'primary': { value: { base: '{colors.gray.0}', _dark: '{colors.darkgray.1000}' } },
      'primary-hover': { value: { base: '{colors.gray.0}', _dark: '{colors.darkgray.1000}' } },
      'primary-pressed': { value: { base: '{colors.gray.0}', _dark: '{colors.darkgray.1000}' } },
      'primary-disabled': { value: { base: '{colors.gray.500}', _dark: '{colors.darkgray.700}' } },
      'secondary': { value: { base: '{colors.gray.700}', _dark: '{colors.darkgray.500}' } },
      'secondary-hover': { value: { base: '{colors.gray.700}', _dark: '{colors.darkgray.500}' } },
      'secondary-pressed': { value: { base: '{colors.gray.700}', _dark: '{colors.darkgray.500}' } },
      'secondary-disabled': { value: { base: '{colors.gray.500}', _dark: '{colors.darkgray.700}' } },
      'danger': { value: { base: '{colors.gray.0}', _dark: '{colors.darkgray.1000}' } },
      'danger-hover': { value: { base: '{colors.gray.0}', _dark: '{colors.darkgray.1000}' } },
      'danger-pressed': { value: { base: '{colors.gray.0}', _dark: '{colors.darkgray.1000}' } },
      'danger-disabled': { value: { base: '{colors.gray.500}', _dark: '{colors.darkgray.700}' } },
    },
    border: {
      primary: { value: { base: '{colors.gray.300}', _dark: '{colors.darkgray.0}' } },
    },
  },

  /**
   * Text Field
   */
  'text-field': {
    border: {
      'primary-inactive': { value: { base: '{colors.gray.500}', _dark: '{colors.darkgray.600}' } },
      'primary-hover': { value: { base: '{colors.gray.300}', _dark: '{colors.darkgray.400}' } },
      'primary-active': { value: { base: '{colors.gray.1000}', _dark: '{colors.darkgray.800}' } },
      'primary-filled': { value: { base: '{colors.gray.1000}', _dark: '{colors.darkgray.800}' } },
      'primary-disabled': { value: { base: '{colors.gray.300}', _dark: '{colors.darkgray.300}' } },
      'danger-inactive': { value: { base: '{colors.red.600}', _dark: '{colors.red.500}' } },
      'danger-hover': { value: { base: '{colors.red.300}', _dark: '{colors.red.800}' } },
      'danger-active': { value: { base: '{colors.red.600}', _dark: '{colors.red.500}' } },
      'danger-filled': { value: { base: '{colors.red.600}', _dark: '{colors.darkgray.800}' } },
      'danger-disabled': { value: { base: '{colors.gray.300}', _dark: '{colors.darkgray.300}' } },
    },
    foreground: {
      'primary-inactive': { value: { base: '{colors.gray.500}', _dark: '{colors.darkgray.800}' } },
      'primary-hover': { value: { base: '{colors.gray.500}', _dark: '{colors.darkgray.800}' } },
      'primary-active': { value: { base: '{colors.gray.1000}', _dark: '{colors.darkgray.1000}' } },
      'primary-filled': { value: { base: '{colors.gray.1000}', _dark: '{colors.darkgray.1000}' } },
      'primary-disabled': { value: { base: '{colors.gray.500}', _dark: '{colors.darkgray.500}' } },
      'danger-inactive': { value: { base: '{colors.red.600}', _dark: '{colors.red.400}' } },
      'danger-hover': { value: { base: '{colors.red.600}', _dark: '{colors.red.400}' } },
      'danger-active': { value: { base: '{colors.red.600}', _dark: '{colors.red.400}' } },
      'danger-filled': { value: { base: '{colors.gray.1000}', _dark: '{colors.darkgray.1000}' } },
      'danger-disabled': { value: { base: '{colors.gray.500}', _dark: '{colors.darkgray.500}' } },
    },
    background: {
      'primary-inactive': { value: { base: '{colors.gray.0}', _dark: '{colors.darkgray.0}' } },
      'primary-hover': { value: { base: '{colors.gray.0}', _dark: '{colors.darkgray.0}' } },
      'primary-active': { value: { base: '{colors.gray.0}', _dark: '{colors.darkgray.0}' } },
      'primary-filled': { value: { base: '{colors.gray.0}', _dark: '{colors.darkgray.0}' } },
      'primary-disabled': { value: { base: '{colors.gray.200}', _dark: '{colors.gray.300}' } },
      'danger-inactive': { value: { base: '{colors.red.100}', _dark: '{colors.red.900}' } },
      'danger-hover': { value: { base: '{colors.red.100}', _dark: '{colors.red.900}' } },
      'danger-active': { value: { base: '{colors.gray.0}', _dark: '{colors.darkgray.0}' } },
      'danger-filled': { value: { base: '{colors.gray.0}', _dark: '{colors.darkgray.0}' } },
      'danger-disabled': { value: { base: '{colors.gray.200}', _dark: '{colors.gray.300}' } },
    },
    message: {
      DEFAULT: { value: { base: '{colors.gray.700}', _dark: '{colors.darkgray.500}' } },
      error: { value: { base: '{colors.red.600}', _dark: '{colors.red.500}' } },
    },
  },

  /**
   * Tab
   */
  'tab': {
    background: {
      DEFAULT: { value: { base: '{colors.gray.0}', _dark: '{colors.darkgray.1000}' } },
      selected: { value: { base: '{colors.gray.0}', _dark: '{colors.darkgray.1000}' } },
      hover: { value: { base: '{colors.gray.200}', _dark: '{colors.darkgray.350}' } },
    },
    foreground: {
      DEFAULT: { value: { base: '{colors.gray.500}', _dark: '{colors.darkgray.500}' } },
      selected: { value: { base: '{colors.gray.1000}', _dark: '{colors.darkgray.1000}' } },
      hover: { value: { base: '{colors.gray.1000}', _dark: '{colors.darkgray.1000}' } },
    },
    border: {
      DEFAULT: { value: { base: '{colors.gray.1000}', _dark: '{colors.darkgray.1000}' } },
      selected: { value: { base: '{colors.gray.300}', _dark: '{colors.darkgray.800}' } },
      hover: { value: { base: '{colors.gray.300}', _dark: '{colors.darkgray.800}' } },
    },
  },
});
