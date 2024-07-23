import { defineConfig } from '@pandacss/dev';
import { preset } from './src';

const prod = process.env.NODE_ENV === 'production';

export default defineConfig({
  importMap: '@readable/styled-system',
  outExtension: 'js',

  eject: true,
  presets: [preset],

  strictPropertyValues: true,
  strictTokens: true,

  separator: '-',
  hash: prod,
  minify: prod,
});
