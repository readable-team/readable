import { router } from '@/trpc';
import { authRouter } from './routers/auth';
import { imageRouter } from './routers/image';
import { userRouter } from './routers/user';

export const appRouter = router({
  auth: authRouter,
  image: imageRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
