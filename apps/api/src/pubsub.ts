import { nanoid } from 'nanoid';
import { dev, env } from '@/env';
import { pub, rabbit } from '@/mq';
import { createPubSub } from './utils/pubsub';
import type { PageContentSyncKind } from '@/enums';
import type { TypedEventTarget } from './utils/pubsub';

const key = nanoid();
const exchange = 'pubsub';
const queue = dev ? `pubsub:local:${key}` : `pubsub:${env.PUBLIC_PULUMI_STACK}:${key}`;
const routingKey = dev ? `pubsub:local:${key}` : `pubsub:${env.PUBLIC_PULUMI_STACK}`;

export const createEventTarget = async <T extends CustomEvent>(): Promise<TypedEventTarget<T>> => {
  const handlersMap = new Map<string, Set<(event: T) => void>>();

  await rabbit.exchangeDeclare({ exchange, type: 'topic' });

  rabbit.createConsumer(
    {
      queue,
      queueOptions: { exclusive: true },
      queueBindings: [{ exchange, queue, routingKey }],
    },
    async (msg) => {
      const event = new CustomEvent(msg.body.name, { detail: msg.body.detail }) as T;
      const handlers = handlersMap.get(event.type);

      if (handlers) {
        for (const handler of handlers) {
          handler(event);
        }
      }
    },
  );

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
      pub.send({ exchange, routingKey }, { name: event.type, detail: event.detail });
      return true;
    },
  };
};

export const pubsub = createPubSub<{
  'page:content:sync': [pageId: string, { pageId: string; kind: PageContentSyncKind; data: string }];
}>({
  eventTarget: await createEventTarget(),
});
