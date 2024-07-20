import { initTRPC } from '@trpc/server';
import { parse, stringify } from 'devalue';
import type { Context } from './context';

const t = initTRPC.context<Context>().create({
  transformer: {
    serialize: stringify,
    deserialize: parse,
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;
