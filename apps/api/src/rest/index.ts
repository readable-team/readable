import Elysia from 'elysia';
import { caddy } from './caddy';
import { healthz } from './healthz';
import { opengraph } from './opengraph';

export const elysia = new Elysia();

elysia.use(caddy);
elysia.use(healthz);
elysia.use(opengraph);
