import FileUpIcon from '~icons/lucide/file-up';
import GalleryVerticalEndIcon from '~icons/lucide/gallery-vertical-end';
import Heading1Icon from '~icons/lucide/heading-1';
import Heading2Icon from '~icons/lucide/heading-2';
import Heading3Icon from '~icons/lucide/heading-3';
import ImageIcon from '~icons/lucide/image';
import InfoIcon from '~icons/lucide/info';
import ListIcon from '~icons/lucide/list';
import ListOrderedIcon from '~icons/lucide/list-ordered';
import MinusIcon from '~icons/lucide/minus';
import PanelTopIcon from '~icons/lucide/panel-top';
import PaperclipIcon from '~icons/lucide/paperclip';
import TableIcon from '~icons/lucide/table';
import TextQuoteIcon from '~icons/lucide/text-quote';
import { env } from '$env/dynamic/public';
import type { Editor, Range } from '@tiptap/core';
import type { MenuItem } from './types';

export const chain = (editor: Editor, range: Range) => {
  return editor.chain().focus().deleteRange(range);
};

export const menuItems: MenuItem[] = [
  {
    id: 'heading-1',
    type: 'heading',
    group: 'heading',
    name: '제목 1',
    keywords: ['heading 1'],
    icon: Heading1Icon,
    command: ({ editor, range }) => {
      chain(editor, range).setNode('heading', { level: 1 }).run();
    },
  },
  {
    id: 'heading-2',
    type: 'heading',
    group: 'heading',
    name: '제목 2',
    keywords: ['heading 2'],
    icon: Heading2Icon,
    command: ({ editor, range }) => {
      chain(editor, range).setNode('heading', { level: 2 }).run();
    },
  },
  {
    id: 'heading-3',
    type: 'heading',
    group: 'heading',
    name: '제목 3',
    keywords: ['heading 3'],
    icon: Heading3Icon,
    command: ({ editor, range }) => {
      chain(editor, range).setNode('heading', { level: 3 }).run();
    },
  },
  {
    id: 'blockquote',
    type: 'blockquote',
    group: 'block',
    name: '인용',
    keywords: ['blockquote'],
    icon: TextQuoteIcon,
    command: ({ editor, range }) => {
      chain(editor, range).setBlockquote().run();
    },
  },
  {
    id: 'divider',
    type: 'horizontalRule',
    group: 'block',
    name: '구분선',
    keywords: ['divider'],
    icon: MinusIcon,
    command: ({ editor, range }) => {
      chain(editor, range).setHorizontalRule().run();
    },
  },
  {
    id: 'bullet-list',
    type: 'bulletList',
    group: 'block',
    name: '순서 없는 목록',
    keywords: ['bullet list'],
    icon: ListIcon,
    command: ({ editor, range }) => {
      chain(editor, range).toggleBulletList().run();
    },
  },
  {
    id: 'ordered-list',
    type: 'orderedList',
    group: 'block',
    name: '순서 있는 목록',
    keywords: ['ordered list'],
    icon: ListOrderedIcon,
    command: ({ editor, range }) => {
      chain(editor, range).toggleOrderedList().run();
    },
  },
  {
    id: 'hint',
    type: 'hint',
    group: 'block',
    name: '힌트',
    keywords: ['hint'],
    icon: InfoIcon,
    command: ({ editor, range }) => {
      chain(editor, range).setHint().run();
    },
  },
  {
    id: 'callout',
    type: 'callout',
    group: 'block',
    name: '콜아웃',
    keywords: ['callout'],
    icon: GalleryVerticalEndIcon,
    command: ({ editor, range }) => {
      chain(editor, range).setCallout().run();
    },
  },
  {
    id: 'table',
    type: 'table',
    group: 'block',
    name: '표',
    keywords: ['table'],
    icon: TableIcon,
    visible: env.PUBLIC_PULUMI_STACK !== 'prod',
    command: ({ editor, range }) => {
      chain(editor, range).insertTable({ rows: 2, cols: 2, withHeaderRow: false }).run();
    },
  },
  {
    id: 'tabs',
    type: 'tabs',
    group: 'block',
    name: '탭',
    keywords: ['tabs'],
    icon: PanelTopIcon,
    visible: env.PUBLIC_PULUMI_STACK !== 'prod',
    command: ({ editor, range }) => {
      chain(editor, range).setTabs().run();
    },
  },
  {
    id: 'image',
    type: 'image',
    group: 'media',
    name: '이미지',
    keywords: ['image', 'picture'],
    icon: ImageIcon,
    command: ({ editor, range }) => {
      chain(editor, range).setImage().run();
    },
  },
  {
    id: 'inline-image',
    type: 'inlineImage',
    group: 'media',
    name: '인라인 이미지',
    keywords: ['inline image'],
    icon: ImageIcon,
    command: ({ editor, range }) => {
      chain(editor, range).setInlineImage().run();
    },
  },
  {
    id: 'file',
    type: 'file',
    group: 'media',
    name: '파일',
    keywords: ['file', 'attachment'],
    icon: PaperclipIcon,
    command: ({ editor, range }) => {
      chain(editor, range).setFile().run();
    },
  },
  {
    id: 'embed',
    type: 'embed',
    group: 'media',
    name: '임베드',
    keywords: ['embed', 'link'],
    icon: FileUpIcon,
    command: ({ editor, range }) => {
      chain(editor, range).setEmbed().run();
    },
  },
];
