import Elysia from 'elysia';
import { caddy } from './caddy';
import { healthz } from './healthz';

export const elysia = new Elysia();

elysia.use(caddy);
elysia.use(healthz);
