import cookie from 'cookie';
import DataLoader from 'dataloader';
import { eq } from 'drizzle-orm';
import stringify from 'fast-json-stable-stringify';
import * as R from 'radash';
import { db, UserSessions } from './db';
import { decodeAccessToken } from './utils/access-token';
import type { Server } from 'bun';
import type { YogaInitialContext } from 'graphql-yoga';

type LoaderParams<T, R, S, N extends boolean, M extends boolean> = {
  name: string;
  nullable?: N;
  many?: M;
  key: (value: N extends true ? R | null : R) => N extends true ? S | null : S;
  load: (keys: T[]) => Promise<R[]>;
};

type ServerContext = YogaInitialContext & {
  server: Server;
  resHeaders: Headers;
};

type DefaultContext = {
  'req': Request;
  'resHeaders': Headers;

  'clientAddress'?: string;

  'loader': <T, R, S, N extends boolean = false, M extends boolean = false, RR = N extends true ? R | null : R>(
    params: LoaderParams<T, R, S, N, M>,
  ) => DataLoader<T, M extends true ? RR[] : RR, string>;
  ' $loaders': Map<string, DataLoader<unknown, unknown>>;
};

export type UserContext = {
  session: {
    id: string;
    userId: string;
  };
};

export type Context = DefaultContext & Partial<UserContext>;

export const createContext = async ({ request, server, resHeaders }: ServerContext) => {
  const ctx: Context = {
    'req': request,
    resHeaders,

    'clientAddress': server.requestIP(request)?.address,

    'loader': <
      T,
      R,
      S,
      N extends boolean = false,
      M extends boolean = false,
      RR = N extends true ? R | null : R,
      F = M extends true ? RR[] : RR,
    >({
      name,
      nullable,
      many,
      load,
      key,
    }: LoaderParams<T, R, S, N, M>) => {
      const cached = ctx[' $loaders'].get(name);
      if (cached) {
        return cached as DataLoader<T, F, string>;
      }

      const loader = new DataLoader<T, F, string>(
        async (keys) => {
          const rows = await load(keys as T[]);
          const values = R.group(rows, (row) => stringify(key(row)));
          return keys.map((key) => {
            const value = values[stringify(key)];

            if (value?.length) {
              return many ? value : value[0];
            }

            if (nullable) {
              return null;
            }

            if (many) {
              return [];
            }

            return new Error(`DataLoader(${name}): Missing key`);
          }) as (F | Error)[];
        },
        { cacheKeyFn: (key) => stringify(key) },
      );

      ctx[' $loaders'].set(name, loader);

      return loader;
    },
    ' $loaders': new Map(),
  };

  const cookies = cookie.parse(request.headers.get('cookie') ?? '');

  const accessToken: string | undefined = cookies['rdbl-at'];
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
