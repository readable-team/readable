import { initTRPC, TRPCError } from '@trpc/server';
import { parse, stringify } from 'devalue';
import type { Context } from '@/context';

const t = initTRPC.context<Context>().create({
  transformer: {
    serialize: stringify,
    deserialize: parse,
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

export const sessionProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  return next({
    ctx: {
      session: ctx.session,
    },
  });
});
