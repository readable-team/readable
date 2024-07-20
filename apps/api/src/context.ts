import { eq } from 'drizzle-orm';
import { db, UserSessions } from './db';
import { decodeAccessToken } from './utils/access-token';
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import type { Context as HonoContext } from 'hono';

export type Context = {
  req: Request;
  resHeaders: Headers;

  honoCtx: HonoContext;

  session?: {
    id: string;
    userId: string;
  };
};

export const createContext = async ({ req, resHeaders }: FetchCreateContextFnOptions, honoCtx: HonoContext) => {
  const ctx: Context = {
    req,
    resHeaders,
    honoCtx,
  };

  const accessToken = req.headers.get('authorization')?.split(' ')[1];
  if (accessToken) {
    const sessionId = await decodeAccessToken(accessToken);

    if (sessionId) {
      const sessions = await db
        .select({ id: UserSessions.id, userId: UserSessions.userId })
        .from(UserSessions)
        .where(eq(UserSessions.id, sessionId));

      if (sessions.length > 0) {
        const [session] = sessions;

        ctx.session = {
          id: session.id,
          userId: session.userId,
        };
      }
    }
  }

  return ctx;
};
