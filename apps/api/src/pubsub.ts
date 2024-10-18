import { createRedisEventTarget } from '@graphql-yoga/redis-event-target';
import { createPubSub } from 'graphql-yoga';
import { Redis } from 'ioredis';
import { env } from '@/env';
import type { PageContentSyncKind } from '@/enums';

export const pubsub = createPubSub<{
  'page:content:sync': [pageId: string, { kind: PageContentSyncKind; data: string }];
  'page:content:comment': [pageId: string, null];
  'site:update': [siteId: string, { scope: 'page'; pageId: string } | { scope: 'site' }];
  'team:update': [teamId: string, { scope: 'member'; userId: string } | { scope: 'team' }];
}>({
  eventTarget: createRedisEventTarget({
    publishClient: new Redis(env.REDIS_URL),
    subscribeClient: new Redis(env.REDIS_URL),
  }),
});
