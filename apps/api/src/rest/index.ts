import { Hono } from 'hono';
import { caddy } from './caddy';
import { healthz } from './healthz';

export const hono = new Hono();

hono.route('/', caddy);
hono.route('/', healthz);
