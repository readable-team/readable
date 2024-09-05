import { createInterface } from 'node:readline/promises';
import { and, eq } from 'drizzle-orm';
import { db, Pages } from '@/db';
import { PageState } from '@/enums';
import { enqueueJob } from '@/jobs';

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const siteId = await rl.question('사이트 ID 입력: ');

await db.transaction(async (tx) => {
  await tx
    .select({ pageId: Pages.id })
    .from(Pages)
    .where(and(eq(Pages.siteId, siteId), eq(Pages.state, PageState.PUBLISHED)))
    .then((rows) => rows.map((row) => enqueueJob(tx, 'page:summarize', row.pageId)));
});
