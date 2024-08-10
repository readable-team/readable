import { Hono } from 'hono';

export const healthz = new Hono();

healthz.get('/healthz', (c) => c.json({ '*': true }));
