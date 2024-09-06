import os from 'node:os';
import { eq } from 'drizzle-orm';
import { createPubSub } from 'graphql-yoga';
import { db, firstOrThrow, pg, Pubsubs } from '@/db';
import { dev, env } from '@/env';
import type { TypedEventTarget } from '@graphql-yoga/typed-event-target';
import type { PageContentSyncKind } from '@/enums';

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const channel = `pubsub_${dev ? Bun.sha(os.hostname(), 'hex').slice(0, 6) : env.PUBLIC_PULUMI_STACK!}`;

export const createEventTarget = async <T extends CustomEvent>(): Promise<TypedEventTarget<T>> => {
  const handlersMap = new Map<string, Set<(event: T) => void>>();

  await pg.listen(channel, async (value) => {
    let payload = JSON.parse(value);

    if (payload.id) {
      const pubsub = await db
        .select({ payload: Pubsubs.payload })
        .from(Pubsubs)
        .where(eq(Pubsubs.id, payload.id))
        .then(firstOrThrow);

      payload = JSON.parse(pubsub.payload);
    }

    const event = new CustomEvent(payload.name, { detail: payload.detail }) as T;
    const handlers = handlersMap.get(event.type);

    if (handlers) {
      for (const handler of handlers) {
        handler(event);
      }
    }
  });

  return {
    addEventListener: (type, callback) => {
      if (callback) {
        const handlers = handlersMap.get(type) || new Set();
        handlers.add('handleEvent' in callback ? callback.handleEvent : callback);
        handlersMap.set(type, handlers);
      }
    },
    removeEventListener: (type, callback) => {
      if (callback) {
        const handlers = handlersMap.get(type);
        if (handlers) {
          handlers.delete('handleEvent' in callback ? callback.handleEvent : callback);
        }
      }
    },
    dispatchEvent: (event) => {
      const payload = JSON.stringify({ name: event.type, detail: event.detail });

      if (payload.length >= 4096) {
        db.insert(Pubsubs)
          .values({ channel, payload })
          .returning({ id: Pubsubs.id })
          .then(firstOrThrow)
          .then(({ id }) => pg.notify(channel, JSON.stringify({ id })))
          .catch(() => null);
      } else {
        pg.notify(channel, payload).catch(() => null);
      }

      return true;
    },
  };
};

export const pubsub = createPubSub<{
  'page:content:sync': [pageId: string, { pageId: string; kind: PageContentSyncKind; data: string }];
  'site:update': [siteId: string, { scope: 'page'; pageId: string } | { scope: 'site' }];
  'team:update': [teamId: string, { scope: 'member'; userId: string } | { scope: 'team' }];
}>({
  eventTarget: await createEventTarget(),
});
