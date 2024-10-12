import pandacss from '@pandacss/dev/postcss';
import prefixwrap from 'postcss-prefixwrap';

/** @type {import('postcss-load-config').Config} */
export default {
  plugins: [
    pandacss(),
    prefixwrap('.rdbl-widget', {
      nested: '&',
    }),
  ],
};
