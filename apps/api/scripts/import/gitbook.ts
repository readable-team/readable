/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { match } from 'ts-pattern';
import { db } from '@/db';
import { $fetch, insertCategory, insertPage, insertSite } from './utils';
import type { ParseRule } from '@tiptap/pm/model';

const config = {
  name: '',
  slug: '',
  url: '',
};

const rules: ParseRule[] = [
  {
    node: 'image',
    tag: 'div',
    getAttrs: (node) => {
      const img = node.querySelector('> div > img');
      if (!img) {
        return false;
      }

      const src = img.getAttribute('src');
      if (!src) {
        return false;
      }

      const srcUrl = new URL(src);
      const url = srcUrl.searchParams.get('url');

      return {
        url,
      };
    },
  },
  {
    node: 'file',
    tag: 'div',
    getAttrs: (node) => {
      const anchor = node.querySelector('> a');
      if (!anchor) {
        return false;
      }

      const svg = anchor.querySelector('> div:nth-child(1) > div:nth-child(1) > svg');
      if (!svg) {
        return false;
      }

      const style = svg.getAttribute('style');
      if (!style) {
        return false;
      }

      if (!style.includes('file-download.svg')) {
        return false;
      }

      const name = anchor.querySelector('> div:nth-child(2) > div:nth-child(1)');
      if (!name) {
        return false;
      }

      return {
        name: name.textContent,
        url: anchor.getAttribute('href'),
      };
    },
  },
  {
    node: 'hint',
    tag: 'div',
    getAttrs: (node) => {
      const svg = node.querySelector('> div:nth-child(1) > div:nth-child(1) > svg');
      if (!svg) {
        return false;
      }

      const style = svg.getAttribute('style');
      if (!style) {
        return false;
      }

      const icon = style.match(/\/([^/]+)\.svg/)?.[1];
      const type = match(icon)
        .with('circle-info', () => 'info')
        .with('circle-check', () => 'success')
        .with('circle-exclamation', () => 'warning')
        .with('triangle-exclamation', () => 'danger')
        .otherwise(() => null);

      if (!type) {
        return false;
      }

      return { type };
    },
    contentElement: '> div:nth-child(1) > div:nth-child(2)',
  },
];

await db.transaction(async (tx) => {
  const site = await insertSite({
    tx,
    name: config.name,
    slug: config.slug,
  });

  const $ = await $fetch(config.url, '/');
  const elements = $('aside > div > ul > li');

  for (const element of elements) {
    const node = $(element);
    const name = node.find('> div').text();
    const elements = node.find('> ul > li > div');

    const category = await insertCategory({
      tx,
      siteId: site.id,
      name,
    });

    for (const element of elements) {
      const node = $(element);
      const url = node.find('> a').attr('href')!;
      const subelements = node.find('> div > ul > li > div');

      const $$ = await $fetch(config.url, url);
      const title = $$('main > header > h1').text();
      const html = $$('main > div.whitespace-pre-wrap').html()!;

      const page = await insertPage({
        tx,
        siteId: site.id,
        categoryId: category.id,
        parentId: null,
        title,
        html,
        rules,
      });

      for (const subelement of subelements) {
        const node = $(subelement);
        const url = node.find('> a').attr('href')!;

        const $$ = await $fetch(config.url, url);
        const title = $$('main > header > h1').text();
        const html = $$('main > div.whitespace-pre-wrap').html()!;

        await insertPage({
          tx,
          siteId: site.id,
          categoryId: category.id,
          parentId: page.id,
          title,
          html,
          rules,
        });
      }
    }
  }
});

// eslint-disable-next-line unicorn/no-process-exit
process.exit(0);
