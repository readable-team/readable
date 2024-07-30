import path from 'node:path';
import type { Plugin } from 'vite';

export const configurePlugin = (): Plugin => {
  return {
    name: '@readable/gql:configure',
    enforce: 'pre',

    configResolved: async (config) => {
      const gqlRoot = path.join(config.root, '.gql');
      config.server.fs.allow.push(gqlRoot);
    },
  };
};
