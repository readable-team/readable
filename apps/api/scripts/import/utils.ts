import { init } from '@paralleldrive/cuid2';
import { schema } from '@readable/ui/tiptap/server';
import { DOMParser } from '@tiptap/pm/model';
import { load } from 'cheerio';
import { generateJitteredKeyBetween } from 'fractional-indexing-jittered';
import { GlobalWindow } from 'happy-dom';
import puppeteer from 'puppeteer';
import * as Y from 'yjs';
import { Categories, firstOrThrow, PageContents, PageContentSnapshots, PageContentStates, Pages, Sites } from '@/db';
import { env } from '@/env';
import { hashPageContent, makeYDoc } from '@/utils/page';
import { persistBlobAsFile, persistBlobAsImage } from '@/utils/user-contents';
import type { JSONContent } from '@tiptap/core';
import type { Transaction } from '@/db';

const browser = await puppeteer.launch();

export const $fetch = async (base: string, url: string) => {
  const page = await browser.newPage();

  await page.goto(new URL(url, base).toString(), {
    waitUntil: 'networkidle2',
  });

  const html = await page.content();
  await page.close();

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

  await cloneAssets(content);

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

export const cloneAssets = async (content: JSONContent) => {
  if (content.type === 'image' && !content.attrs?.id && content.attrs?.url) {
    const resp = await fetch(content.attrs.url);
    const blob = await resp.blob();
    const image = await persistBlobAsImage({ file: new File([blob], content.attrs.url) });

    content.attrs.id = image.id;
    content.attrs.placeholder = image.placeholder;
    content.attrs.ratio = image.width / image.height;
    content.attrs.url = `${env.PUBLIC_USERCONTENTS_URL}/images/${image.path}`;
  } else if (content.type === 'file' && !content.attrs?.id && content.attrs?.url) {
    const resp = await fetch(content.attrs.url);
    const blob = await resp.blob();
    const file = await persistBlobAsFile({ file: new File([blob], content.attrs.name) });

    content.attrs.id = file.id;
    content.attrs.size = file.size;
    content.attrs.url = `${env.PUBLIC_USERCONTENTS_URL}/files/${file.path}`;
  }

  await Promise.all(content.content?.map(async (child) => cloneAssets(child)) ?? []);
};
