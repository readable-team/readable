import { readdir, readFile } from 'node:fs/promises';
import { createInterface } from 'node:readline/promises';
import { marked } from 'marked';
import { bundledLanguagesInfo } from 'shiki';
import { db } from '@/db';
import { insertCategory, insertPage, insertSite } from './utils';
import type { ParseRule } from '@tiptap/pm/model';

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const rules: ParseRule[] = [
  {
    node: 'image',
    tag: 'p',
    getAttrs: (node) => {
      const img = node.querySelector('> img');
      if (!img) {
        return false;
      }

      const src = img.getAttribute('src');
      if (!src) {
        return false;
      }

      return {
        url: src,
      };
    },
  },
  {
    node: 'codeBlock',
    tag: 'pre',
    getAttrs: (node) => {
      const code = node.querySelector('> code');
      if (!code) {
        return false;
      }

      const language = code.className.match(/language-(\w[\w#+-]*)/)?.[1];
      if (!language) {
        return { language: 'text' };
      }
      const languageInfo = bundledLanguagesInfo.find(
        (info) => info.id === language || info.aliases?.find((alias) => alias === language),
      );
      if (!languageInfo) {
        return { language: 'text' };
      }

      return { language: languageInfo.id };
    },
    contentElement: '> code',
  },
];

const siteName = (await rl.question('사이트 이름: ')) || '테스트';
const siteSlug = (await rl.question('사이트 slug: ')) || 'import-test';

await db.transaction(async (tx) => {
  const site = await insertSite({
    tx,
    name: siteName,
    slug: siteSlug,
  });

  const category = await insertCategory({
    tx,
    siteId: site.id,
    name: siteName,
  });

  for (const file of await readdir('./import-files')) {
    const content = await readFile(`./import-files/${file}`, 'utf8');
    const title = file.split('.')[0].replaceAll('-', ' ');
    const html = await marked.parse(content, {
      gfm: true,
    });

    await insertPage({
      tx,
      siteId: site.id,
      categoryId: category.id,
      parentId: null,
      title,
      html,
      rules,
    });
  }
});

process.exit(0);
