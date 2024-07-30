import { router, sessionProcedure } from '@/trpc';

export const playgroundRouter = router({
  stream: sessionProcedure.subscription(async function* ({ ctx }) {
    let i = 0;

    while (true) {
      if (ctx.req.signal.aborted) {
        break;
      }

      yield i++;
      await Bun.sleep(1000);
    }
  }),
});
