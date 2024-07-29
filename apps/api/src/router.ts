import { router } from '@/trpc';
import { authRouter } from './routers/auth';
import { blobRouter } from './routers/blob';
import { pageRouter } from './routers/page';
import { playgroundRouter } from './routers/playground';
import { publicRouter } from './routers/public';
import { siteRouter } from './routers/site';
import { userRouter } from './routers/user';
import { workspaceRouter } from './routers/workspace';

export const appRouter = router({
  auth: authRouter,
  blob: blobRouter,
  page: pageRouter,
  playground: playgroundRouter,
  public: publicRouter,
  site: siteRouter,
  user: userRouter,
  workspace: workspaceRouter,
});

export type AppRouter = typeof appRouter;
