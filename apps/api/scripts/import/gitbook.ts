/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { db } from '@/db';
import { $fetch, insertCategory, insertPage, insertSite } from './utils';

const config = {
  name: '',
  slug: '',
  url: '',
};

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
        });
      }
    }
  }
});

// eslint-disable-next-line unicorn/no-process-exit
process.exit(0);
