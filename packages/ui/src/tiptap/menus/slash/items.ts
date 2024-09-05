import FileUpIcon from '~icons/lucide/file-up';
import GalleryVerticalEndIcon from '~icons/lucide/gallery-vertical-end';
import Heading1Icon from '~icons/lucide/heading-1';
import Heading2Icon from '~icons/lucide/heading-2';
import Heading3Icon from '~icons/lucide/heading-3';
import ImageIcon from '~icons/lucide/image';
import ListIcon from '~icons/lucide/list';
import ListOrderedIcon from '~icons/lucide/list-ordered';
import MinusIcon from '~icons/lucide/minus';
import PaperclipIcon from '~icons/lucide/paperclip';
import TextQuoteIcon from '~icons/lucide/text-quote';
import type { MenuItem } from './types';

export const menuItems: MenuItem[] = [
  {
    id: 'heading-1',
    group: 'heading',
    name: '제목 1',
    keywords: ['heading 1'],
    icon: Heading1Icon,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run();
    },
  },
  {
    id: 'heading-2',
    group: 'heading',
    name: '제목 2',
    keywords: ['heading 2'],
    icon: Heading2Icon,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run();
    },
  },
  {
    id: 'heading-3',
    group: 'heading',
    name: '제목 3',
    keywords: ['heading 3'],
    icon: Heading3Icon,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run();
    },
  },
  {
    id: 'blockquote',
    group: 'block',
    name: '인용',
    keywords: ['blockquote'],
    icon: TextQuoteIcon,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setBlockquote().run();
    },
  },
  {
    id: 'divider',
    group: 'block',
    name: '구분선',
    keywords: ['divider'],
    icon: MinusIcon,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run();
    },
  },
  {
    id: 'bullet-list',
    group: 'block',
    name: '순서 없는 목록',
    keywords: ['bullet list'],
    icon: ListIcon,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    id: 'ordered-list',
    group: 'block',
    name: '순서 있는 목록',
    keywords: ['ordered list'],
    icon: ListOrderedIcon,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    id: 'callout',
    group: 'block',
    name: '콜아웃',
    keywords: ['callout'],
    icon: GalleryVerticalEndIcon,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setCallout().run();
    },
  },
  {
    id: 'image',
    group: 'media',
    name: '이미지',
    keywords: ['image', 'picture'],
    icon: ImageIcon,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setImage().run();
    },
  },
  {
    id: 'file',
    group: 'media',
    name: '파일',
    keywords: ['file', 'attachment'],
    icon: PaperclipIcon,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setFile().run();
    },
  },
  {
    id: 'embed',
    group: 'media',
    name: '임베드',
    keywords: ['embed', 'link'],
    icon: FileUpIcon,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setEmbed().run();
    },
  },
];
