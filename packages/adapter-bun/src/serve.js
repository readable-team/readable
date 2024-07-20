import path from 'node:path';

/**
 * @typedef {Object} ServeParams
 * @property {typeof import('@sveltejs/kit').Server} Server
 * @property {import('@sveltejs/kit').SSRManifest} manifest
 * @property {Record<string, string>} prerendered
 */

/**
 * @param {ServeParams} params
 */

export const serve = async ({ Server, manifest, prerendered }) => {
  const basePath = path.dirname(Bun.main);

  const sveltekit = new Server(manifest);
  await sveltekit.init({ env: process.env });

  Bun.serve({
    port: 3000,
    fetch: async (request, server) => {
      const url = new URL(request.url);

      if (url.pathname === '/healthz') {
        return new Response(JSON.stringify({ '*': true }), {
          headers: {
            'content-type': 'application/json',
            'cache-control': 'public, max-age=0, must-revalidate',
          },
        });
      }

      const relativePath = url.pathname.slice(1);
      if (manifest.assets.has(relativePath) || relativePath.startsWith(manifest.appPath)) {
        const immutable = relativePath.startsWith(`${manifest.appPath}/immutable`);
        const filePath = path.join(basePath, 'client', relativePath);

        const file = Bun.file(filePath);
        const buffer = await file.arrayBuffer();

        return new Response(buffer, {
          headers: {
            'cache-control': immutable ? 'public, max-age=31536000, immutable' : 'public, max-age=0, must-revalidate',
            'content-type': file.type,
            'content-length': file.size,
          },
        });
      }

      if (url.pathname in prerendered) {
        const filePath = path.join(basePath, 'client', prerendered[url.pathname]);

        const file = Bun.file(filePath);
        const buffer = await file.arrayBuffer();

        return new Response(buffer, {
          headers: {
            'cache-control': 'public, max-age=0, must-revalidate',
            'content-type': file.type,
            'content-length': file.size,
          },
        });
      }

      const protocol = request.headers.get('x-forwarded-proto') ?? 'https';
      const host = request.headers.get('host') ?? process.env.HTTP_HOST;

      const effectiveRequest = new Request(`${protocol}://${host}${url.pathname}${url.search}`, request);

      const response = await sveltekit.respond(effectiveRequest, {
        getClientAddress: () => {
          const xff = request.headers.get('x-forwarded-for');
          const hop = Number(process.env.HTTP_XFF_HOP) || 0;

          if (xff && hop > 0) {
            const addresses = xff.split(',');
            return addresses.at(-hop)?.trim() ?? '';
          }

          return server.requestIP(request)?.address ?? '';
        },
      });

      if (response.headers.get('cache-control') === null) {
        response.headers.set('cache-control', 'private, no-cache');
      }

      return response;
    },
  });
};
