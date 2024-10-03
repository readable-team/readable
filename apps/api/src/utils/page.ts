import { schema } from '@readable/ui/tiptap/server';
import { Node } from '@tiptap/pm/model';
import stringify from 'fast-json-stable-stringify';
import { prosemirrorToYXmlFragment } from 'y-prosemirror';
import * as Y from 'yjs';
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

type MakeYDocParams = {
  title: string | null;
  subtitle: string | null;
  content: JSONContent;
};
export const makeYDoc = ({ title, subtitle, content }: MakeYDocParams) => {
  const node = Node.fromJSON(schema, content);
  const doc = new Y.Doc();

  doc.getText('title').insert(0, title ?? '');
  doc.getText('subtitle').insert(0, subtitle ?? '');

  const fragment = doc.getXmlFragment('content');
  prosemirrorToYXmlFragment(node, fragment);

  return doc;
};
