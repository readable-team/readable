import { init } from '@paralleldrive/cuid2';
import { schema } from '@readable/ui/tiptap/server';
import { DOMParser } from '@tiptap/pm/model';
import { load } from 'cheerio';
import { generateJitteredKeyBetween } from 'fractional-indexing-jittered';
import { GlobalWindow } from 'happy-dom';
import * as Y from 'yjs';
import { Categories, firstOrThrow, PageContents, PageContentSnapshots, PageContentStates, Pages, Sites } from '@/db';
import { hashPageContent, makeYDoc } from '@/utils/page';
import type { JSONContent } from '@tiptap/core';
import type { Transaction } from '@/db';

export const $fetch = async (base: string, url: string) => {
  const resp = await fetch(new URL(url, base));
  const html = await resp.text();
  return load(html);
};

const encoder = new TextEncoder();
const orders: Record<string, string> = {};
const nextOrder = (key: string) => {
  orders[key] = generateJitteredKeyBetween(orders[key] ?? null, null);
  return encoder.encode(orders[key]);
};

type InsertSiteParams = {
  tx: Transaction;
  name: string;
  slug: string;
};
export const insertSite = async ({ tx, name, slug }: InsertSiteParams) => {
  const site = await tx
    .insert(Sites)
    .values({
      name,
      teamId: 'T00000IMPORT',
      slug: `${slug}-${init({ length: 6 })()}`,
      themeColor: '#000000',
    })
    .returning()
    .then(firstOrThrow);

  return site;
};

type InsertCategoryParams = {
  tx: Transaction;
  siteId: string;
  name: string;
};
export const insertCategory = async ({ tx, siteId, name }: InsertCategoryParams) => {
  const order = nextOrder('');

  const category = await tx
    .insert(Categories)
    .values({
      siteId,
      name,
      order,
      state: 'ACTIVE',
    })
    .returning()
    .then(firstOrThrow);

  return category;
};

type InsertPageParams = {
  tx: Transaction;
  siteId: string;
  categoryId: string;
  parentId: string | null;
  title: string;
  html: string;
};
export const insertPage = async ({ tx, siteId, categoryId, parentId, title, html }: InsertPageParams) => {
  const order = nextOrder(parentId ?? categoryId);

  const window = new GlobalWindow();
  window.document.body.innerHTML = html;

  const node = DOMParser.fromSchema(schema).parse(window.document.body as never);
  const text = node.content.textBetween(0, node.content.size, '\n');
  const content: JSONContent = node.toJSON();

  const yDoc = makeYDoc({ title, content });

  const update = Y.encodeStateAsUpdateV2(yDoc);
  const vector = Y.encodeStateVector(yDoc);
  const snapshot = Y.encodeSnapshotV2(Y.snapshot(yDoc));

  const page = await tx
    .insert(Pages)
    .values({
      siteId,
      categoryId,
      parentId,
      order,
      state: 'PUBLISHED',
    })
    .returning()
    .then(firstOrThrow);

  await tx.insert(PageContents).values({
    pageId: page.id,
    title: title.length > 0 ? title : null,
    content,
    text,
    hash: hashPageContent({ title, content }),
  });

  await tx.insert(PageContentStates).values({
    pageId: page.id,
    update,
    vector,
    title: title.length > 0 ? title : null,
    content,
    text,
    hash: hashPageContent({ title, content }),
    seq: 0n,
  });

  await tx.insert(PageContentSnapshots).values({
    pageId: page.id,
    snapshot,
  });

  return page;
};
