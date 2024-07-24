import { router, sessionProcedure } from '@/trpc';

export const playgroundRouter = router({
  stream: sessionProcedure.subscription(async function* () {
    let i = 0;
    while (true) {
      yield i++;
      await Bun.sleep(1000);
    }
  }),
});
