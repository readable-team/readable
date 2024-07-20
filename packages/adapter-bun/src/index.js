import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * @returns {import("@sveltejs/kit").Adapter}
 */
export const bun = () => {
  return {
    name: '@readable/adapter-bun',
    adapt: async (builder) => {
      const out = 'dist';

      const prerendered = {};
      for (const [p, { file }] of builder.prerendered.pages.entries()) {
        prerendered[p] = file;
      }

      builder.rimraf(out);
      builder.mkdirp(out);

      builder.writeServer(path.join(out, 'server'));
      builder.writeClient(path.join(out, 'client'));
      builder.writePrerendered(path.join(out, 'client'));

      await fs.appendFile(
        path.join(out, 'server/manifest.js'),
        `export const prerendered = ${JSON.stringify(prerendered)};`,
      );

      await fs.writeFile(
        path.join(out, 'index.js'),
        `
          import { serve } from './serve.js';
          import { Server } from './server/index.js';
          import { manifest, prerendered } from './server/manifest.js';

          await serve({ Server, manifest, prerendered });
        `,
      );

      builder.copy(path.join(__dirname, 'serve.js'), path.join(out, 'serve.js'));
    },
  };
};
