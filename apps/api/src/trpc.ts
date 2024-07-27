import * as Sentry from '@sentry/bun';
import { initTRPC, TRPCError } from '@trpc/server';
import { logger } from '@/logging';
import { transformer } from '@/transformer';
import type { Context } from '@/context';

const t = initTRPC.context<Context>().create({
  transformer,
});

const sentryMiddleware = t.middleware(
  Sentry.trpcMiddleware({
    attachRpcInput: true,
  }),
);

export const router = t.router;
const baseProcedure = t.procedure.use(sentryMiddleware).use(async ({ ctx, path, type, next }) => {
  const start = Bun.nanoseconds();
  const result = await next();
  const end = Bun.nanoseconds();

  const duration = (end - start) / 1e6;

  const trpcLogger = logger.child({
    scope: 'trpc',
    ip: ctx.clientAddress,
    user: ctx.session?.userId,
    type,
    path,
    duration,
  });

  if (result.ok) {
    trpcLogger.info({
      result: 'ok',
    });
  } else {
    trpcLogger.error({
      result: result.error.code.toLowerCase(),
      err: result.error,
    });
  }

  return result;
});

export const publicProcedure = baseProcedure;
export const sessionProcedure = baseProcedure.use(async ({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  return next({
    ctx: {
      session: ctx.session,
    },
  });
});
