import Elysia from 'elysia';

export const healthz = new Elysia({ prefix: '/healthz' });

healthz.get('/', () => ({ '*': true }));
