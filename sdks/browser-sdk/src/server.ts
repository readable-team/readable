import { $ } from 'bun';

// eslint-disable-next-line unicorn/prefer-top-level-await
(async () => {
  await $`vite build --watch`;
})();

Bun.serve({
  port: 3100,
  fetch: (req) => {
    const url = new URL(req.url);
    const pathname = url.pathname;

    const file = Bun.file(`./dist/${pathname}`);
    return new Response(file, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
      },
    });
  },
});
