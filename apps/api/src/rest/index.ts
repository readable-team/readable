import Elysia from 'elysia';
import { caddy } from './caddy';
import { healthz } from './healthz';
import { opengraph } from './opengraph';
import { widget } from './widget';

export const elysia = new Elysia();

elysia.use(caddy);
elysia.use(healthz);
elysia.use(opengraph);
elysia.use(widget);
