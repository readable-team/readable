import './cron';

import os from 'node:os';
import { logger } from '@readable/lib';
import { Semaphore } from 'async-mutex';
import dayjs from 'dayjs';
import { and, asc, eq, sql } from 'drizzle-orm';
import { db, first, Jobs } from '@/db';
import { JobState } from '@/enums';
import { dev, env } from '@/env';
import { PageContentStateUpdateJob, PageSearchIndexUpdateJob, PageSummarizeJob } from './page';
import type { Transaction } from '@/db';
import type { JobFn } from './types';

const jobs = [PageContentStateUpdateJob, PageSearchIndexUpdateJob, PageSummarizeJob];

type Jobs = typeof jobs;
type JobName = Jobs[number]['name'];
type JobMap = { [Job in Jobs[number] as Job['name']]: Job['fn'] };

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const lane = dev ? os.hostname() : env.PUBLIC_PULUMI_STACK!;
const jobMap = Object.fromEntries(jobs.map((job) => [job.name, job.fn])) as JobMap;

const semaphore = new Semaphore(10);

const loop = async () => {
  await semaphore.runExclusive(async () => {
    await db.transaction(async (tx) => {
      const job = await tx
        .select({
          id: Jobs.id,
          name: Jobs.name,
          payload: Jobs.payload,
          retries: Jobs.retries,
          _: sql`'@silent@'`,
        })
        .from(Jobs)
        .where(and(eq(Jobs.lane, lane), eq(Jobs.state, JobState.PENDING)))
        .limit(1)
        .orderBy(asc(Jobs.createdAt))
        .for('update', { skipLocked: true })
        .then(first);

      if (job) {
        loop();
        await work(tx, job);
      } else {
        setTimeout(loop, 1000);
      }
    });
  });
};

const work = async (tx: Transaction, job: Pick<typeof Jobs.$inferSelect, 'id' | 'name' | 'payload' | 'retries'>) => {
  try {
    const fn = jobMap[job.name as JobName];
    if (!fn) {
      throw new Error('job not found');
    }

    if (job.retries >= 3) {
      throw new Error('max retries');
    }

    await fn(job.payload as never);

    await tx
      .update(Jobs)
      .set({
        state: JobState.COMPLETED,
        updatedAt: dayjs(),
      })
      .where(eq(Jobs.id, job.id));
  } catch (err) {
    logger.error(err, `${job.name} failed`);

    if (job.retries < 3) {
      await tx
        .update(Jobs)
        .set({
          retries: job.retries + 1,
          updatedAt: dayjs(),
        })
        .where(eq(Jobs.id, job.id));
    } else {
      await tx
        .update(Jobs)
        .set({
          state: JobState.FAILED,
          updatedAt: dayjs(),
        })
        .where(eq(Jobs.id, job.id));
    }
  }
};

export const enqueueJob = async <N extends JobName, F extends JobMap[N]>(
  tx: Transaction,
  name: N,
  payload: F extends JobFn<infer P> ? P : never,
) => {
  await tx.insert(Jobs).values({
    name,
    lane,
    payload,
  });
};

loop();
