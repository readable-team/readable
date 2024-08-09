import { eq } from 'drizzle-orm';
import { db, PageContents, PageContentStates, Pages } from '@/db';
import { PageState } from '@/enums';
import { searchIndex } from '@/search';

const index = searchIndex('pages');

const publishedPages = await db
  .select({
    id: Pages.id,
    siteId: Pages.siteId,
    state: Pages.state,
    title: PageContents.title,
    subtitle: PageContents.subtitle,
    text: PageContents.text,
  })
  .from(Pages)
  .innerJoin(PageContents, eq(Pages.id, PageContents.pageId))
  .where(eq(Pages.state, PageState.PUBLISHED));

const draftPages = await db
  .select({
    id: Pages.id,
    siteId: Pages.siteId,
    state: Pages.state,
    title: PageContentStates.title,
    subtitle: PageContentStates.subtitle,
    text: PageContentStates.text,
  })
  .from(Pages)
  .innerJoin(PageContentStates, eq(Pages.id, PageContentStates.pageId))
  .where(eq(Pages.state, PageState.DRAFT));

const deletedPages = await db.select({ id: Pages.id }).from(Pages).where(eq(Pages.state, PageState.DELETED));

await index.deleteDocuments(deletedPages.map((page) => page.id));
await index.addDocuments(publishedPages);
await index.addDocuments(draftPages);

console.log('Indexed pages:', publishedPages.length + draftPages.length);
