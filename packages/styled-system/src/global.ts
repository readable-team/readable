import { defineGlobalFontface, defineGlobalStyles } from '@pandacss/dev';
import pretendard from './pretendard.json' with { type: 'json' };

export const globalCss = defineGlobalStyles({
  '*': {
    margin: '0',
    padding: '0',
    font: 'inherit',
    color: 'inherit',
    backgroundColor: 'transparent',
  },

  '*, *::before, *::after': {
    boxSizing: 'border-box',
    border: '0 solid {colors.gray.200}',
    outline: '0 solid {colors.gray.200}',
  },

  html: {
    fontFamily: 'ui',
    fontFeatureSettings: '"ss18" 1',
    textSizeAdjust: '100%',

    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',

    color: 'text.primary',
    backgroundColor: 'surface.primary',
    lineHeight: '1.44',
    letterSpacing: '-0.004em',
  },

  a: {
    textDecoration: 'inherit',
  },

  button: {
    cursor: 'pointer',
  },

  hr: {
    height: '0',
  },

  'img, video': {
    display: 'block',
    maxWidth: 'full',
    height: 'auto',
  },

  input: {
    _disabled: {
      opacity: '100',
    },
  },

  'ol, ul': {
    listStyle: 'none',
  },

  ':disabled': {
    cursor: 'default',
  },

  ':focus-visible': {
    outline: 'none',
  },

  '::placeholder': {
    color: 'neutral.50',
  },

  '::-webkit-search-cancel-button': {
    WebkitAppearance: 'none',
  },

  '[hidden]': {
    display: 'none!',
  },
});

export const globalFontface = defineGlobalFontface({
  SUIT: {
    src: 'url("https://cdn.rdbl.app/fonts/SUIT.woff2") format("woff2-variations")',
    fontStyle: 'normal',
    fontWeight: '100 900',
    fontDisplay: 'swap',
  },
  Pretendard: pretendard.map((range, index) => ({
    src: `url("https://cdn.rdbl.app/fonts/PretendardVariable.subset.${index}.woff2") format("woff2-variations")`,
    fontStyle: 'normal',
    fontWeight: '100 900',
    fontDisplay: 'swap',
    unicodeRange: range,
  })),
  FiraCode: {
    src: 'url("https://cdn.rdbl.app/fonts/FiraCode.woff2") format("woff2-variations")',
    fontStyle: 'normal',
    fontWeight: '100 900',
    fontDisplay: 'swap',
  },
});

export const globalVars = {
  '--usersite-theme-color': {
    syntax: '<color>',
    inherits: true,
  },
};
