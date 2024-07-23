import { router } from '@/trpc';
import { authRouter } from './routers/auth';
import { imageRouter } from './routers/image';
import { publicRouter } from './routers/public';
import { siteRouter } from './routers/site';
import { userRouter } from './routers/user';
import { workspaceRouter } from './routers/workspace';

export const appRouter = router({
  auth: authRouter,
  image: imageRouter,
  public: publicRouter,
  site: siteRouter,
  user: userRouter,
  workspace: workspaceRouter,
});

export type AppRouter = typeof appRouter;
