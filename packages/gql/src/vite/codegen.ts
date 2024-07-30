import * as R from 'radash';
import { writeArtifactAssets, writeMiscAssets, writePublicAssets } from '../codegen/writer';
import { buildContext } from '../context';
import type { Plugin } from 'vite';
import type { ContextHolder } from '../types';

export const codegenPlugin = (contextHolder: ContextHolder): Plugin => {
  const buildAndWriteContext = async () => {
    try {
      const context = await buildContext();
      await writeArtifactAssets(context.gqlDir, context.schema, context.operationMap, context.fragmentMap);
      await writePublicAssets(context.gqlDir, context.artifacts);
      await writeMiscAssets(context.gqlDir);
      contextHolder.context = context;
    } catch (err: unknown) {
      console.error('🌈', err);
    }
  };

  const debounced = R.debounce({ delay: 100 }, buildAndWriteContext);

  return {
    name: '@readable/gql:codegen',
    enforce: 'pre',

    buildStart: async () => {
      await buildAndWriteContext();
    },

    configureServer: async () => {
      await buildAndWriteContext();
    },

    watchChange: (id) => {
      if (id.includes('/src/')) {
        debounced();
      }
    },
  };
};
