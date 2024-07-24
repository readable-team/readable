import { observable } from '@trpc/server/observable';
import { router, sessionProcedure } from '@/trpc';

export const playgroundRouter = router({
  stream: sessionProcedure.subscription(() => {
    return observable<number>((observer) => {
      let i = 0;

      const timer = setInterval(() => {
        observer.next(i++);
      }, 1000);

      return () => {
        clearInterval(timer);
      };
    });
  }),
});
