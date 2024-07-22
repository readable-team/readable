import { router } from '@/trpc';
import { authRouter } from './routers/auth';
import { imageRouter } from './routers/image';
import { siteRouter } from './routers/site';
import { userRouter } from './routers/user';
import { workspaceRouter } from './routers/workspace';

export const appRouter = router({
  auth: authRouter,
  image: imageRouter,
  site: siteRouter,
  user: userRouter,
  workspace: workspaceRouter,
});

export type AppRouter = typeof appRouter;
