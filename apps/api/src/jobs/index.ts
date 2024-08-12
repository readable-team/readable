import { nanoid } from 'nanoid';
import { dev, env } from '@/env';
import { pub, rabbit } from '@/mq';
import { PageContentStateUpdateJob, PageSearchIndexUpdateJob, PageSummarizeJob } from './page';
import type { JobFn } from './types';

const jobs = [PageContentStateUpdateJob, PageSearchIndexUpdateJob, PageSummarizeJob];

type Jobs = typeof jobs;
type JobNames = Jobs[number]['name'];
type JobMap = { [Job in Jobs[number] as Job['name']]: Job['fn'] };
type Body = { name: JobNames; payload: unknown; meta: { retry: number } };

const exchange = 'jobs';
const queue = dev ? `jobs:local:${nanoid()}` : `jobs:${env.PUBLIC_PULUMI_STACK}`;
const routingKey = queue;

await rabbit.exchangeDeclare({ exchange, type: 'direct' });

const jobMap = Object.fromEntries(jobs.map((job) => [job.name, job.fn])) as JobMap;
rabbit.createConsumer(
  {
    queue,
    queueOptions: { exclusive: dev },
    queueBindings: [{ exchange, queue, routingKey }],
    concurrency: 1,
    qos: { prefetchCount: 1 },
  },
  async (msg) => {
    const { name, payload, meta } = msg.body as Body;
    try {
      await jobMap[name]?.(payload as never);
    } catch (err: unknown) {
      if (meta.retry < 3) {
        try {
          const body = { name, payload, meta: { retry: meta.retry + 1 } } satisfies Body;
          await pub.send({ exchange, routingKey }, body);
          return;
        } catch {
          // pass
        }
      }

      // Sentry.captureException(err);
      console.error(err);
    }
  },
);

export const enqueueJob = async <N extends JobNames, F extends JobMap[N]>(
  name: N,
  payload: F extends JobFn<infer P> ? P : never,
) => {
  const body = { name, payload, meta: { retry: 0 } } satisfies Body;
  await pub.send({ exchange, routingKey }, body);
};
