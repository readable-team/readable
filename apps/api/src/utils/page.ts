import stringify from 'fast-json-stable-stringify';
import type { JSONContent } from '@tiptap/core';

type HashPageContentParams = {
  title: string | null;
  subtitle: string | null;
  content: JSONContent;
};

export const hashPageContent = ({ title, subtitle, content }: HashPageContentParams) => {
  const payload = stringify({
    title: title?.length ? title : null,
    subtitle: subtitle?.length ? subtitle : null,
    content,
  });

  return Bun.hash(payload).toString();
};
