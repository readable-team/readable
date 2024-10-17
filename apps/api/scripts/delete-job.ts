import dayjs from 'dayjs';
import { and, eq, lt } from 'drizzle-orm';
import { db, Jobs } from '@/db';
import { JobState } from '@/enums';

await db.delete(Jobs).where(and(eq(Jobs.state, JobState.COMPLETED), lt(Jobs.updatedAt, dayjs().subtract(1, 'week'))));
await db.delete(Jobs).where(and(eq(Jobs.state, JobState.FAILED), lt(Jobs.updatedAt, dayjs().subtract(1, 'month'))));
process.exit(0);
