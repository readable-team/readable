import FileIcon from '~icons/lucide/file';
import Heading1Icon from '~icons/lucide/heading-1';
import Heading2Icon from '~icons/lucide/heading-2';
import Heading3Icon from '~icons/lucide/heading-3';
import ImageIcon from '~icons/lucide/image';
import ListIcon from '~icons/lucide/list';
import ListOrderedIcon from '~icons/lucide/list-ordered';
import MinusIcon from '~icons/lucide/minus';
import TextQuoteIcon from '~icons/lucide/text-quote';
import type { MenuItem } from './types';

export const menuItems: MenuItem[] = [
  {
    id: 'heading-1',
    group: 'heading',
    name: '제목 1',
    keywords: ['heading 1'],
    description: '큰 사이즈 제목입니다.',
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
    description: '중간 사이즈 제목입니다.',
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
    description: '작은 사이즈 제목입니다.',
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
    description: '인용된 글입니다.',
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
    description: '구분할 수 있는 선입니다.',
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
    description: '순서가 없는 목록입니다.',
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
    description: '순서가 있는 목록입니다.',
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
    description: '...',
    icon: Heading1Icon, // FIXME: 콜아웃 아이콘
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setCallout().run();
    },
  },
  {
    id: 'image',
    group: 'media',
    name: '이미지',
    keywords: ['image', 'picture'],
    description: '이미지입니다.',
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
    description: '파일입니다.',
    icon: FileIcon,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setFile().run();
    },
  },
];
