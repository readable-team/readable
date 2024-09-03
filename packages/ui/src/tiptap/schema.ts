import { css } from '@readable/styled-system/css';
import { token } from '@readable/styled-system/tokens';
import { createAnchorId } from '@readable/ui/utils';
import { getSchema } from '@tiptap/core';
import { Blockquote } from '@tiptap/extension-blockquote';
import { Bold } from '@tiptap/extension-bold';
import { BulletList } from '@tiptap/extension-bullet-list';
import { Code } from '@tiptap/extension-code';
import { Color } from '@tiptap/extension-color';
import { Document } from '@tiptap/extension-document';
import { Dropcursor } from '@tiptap/extension-dropcursor';
import { HardBreak } from '@tiptap/extension-hard-break';
import { Heading } from '@tiptap/extension-heading';
import { HorizontalRule } from '@tiptap/extension-horizontal-rule';
import { Italic } from '@tiptap/extension-italic';
import { Link } from '@tiptap/extension-link';
import { ListItem } from '@tiptap/extension-list-item';
import { ListKeymap } from '@tiptap/extension-list-keymap';
import { OrderedList } from '@tiptap/extension-ordered-list';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Strike } from '@tiptap/extension-strike';
import { Text } from '@tiptap/extension-text';
import { TextAlign } from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Underline } from '@tiptap/extension-underline';
import { Behavior } from './extensions/behavior';
import { BlockSelectionHelper } from './extensions/block-selection';
import { Placeholder } from './extensions/placeholder';
import { BubbleMenu } from './menus/bubble';
import { FloatingMenu } from './menus/floating';
import { LinkEditPopover } from './menus/link-edit-popover';
import { LinkTooltip } from './menus/link-tooltip';
import { SlashMenu } from './menus/slash';
import { Callout } from './node-views';
import { Embed } from './node-views/embed';
import { File } from './node-views/file';
import { Image } from './node-views/image';

export const extensions = [
  // special nodes
  Document.extend({
    content: 'block+',
  }),
  Text,

  // nodes
  Paragraph.configure({
    HTMLAttributes: {
      class: css({
        textStyle: '16m',
      }),
    },
  }),
  Heading.configure({
    levels: [1, 2, 3],
  }).extend({
    renderHTML({ node, HTMLAttributes }) {
      const hasLevel = node.attrs.level;
      const level = hasLevel ? node.attrs.level : 1;
      const id = createAnchorId(node.textContent);
      const textStyle = node.attrs.level === 1 ? '28b' : node.attrs.level === 2 ? '24b' : '20b';

      return [`h${level}`, { ...HTMLAttributes, id, class: css({ textStyle }) }, 0];
    },
  }),
  HardBreak,
  HorizontalRule.configure({
    HTMLAttributes: {
      class: css({
        paddingY: '12px',
        _before: {
          content: '""',
          display: 'block',
          height: '1px',
          backgroundColor: 'neutral.20',
        },
      }),
    },
  }),
  Blockquote.extend({ content: 'paragraph+' }).configure({
    HTMLAttributes: {
      class: css({
        borderLeftWidth: '3px',
        borderLeftColor: 'neutral.100',
        paddingLeft: '24px',
        color: 'text.primary',
      }),
    },
  }),
  BulletList.configure({
    HTMLAttributes: {
      class: css({
        '&:not(ul ul)': { marginLeft: '10px' }, // ul 루트 노드
        'marginLeft': '-6px',
        'paddingLeft': '16px',
        'listStylePosition': 'outside',
        'listStyleType': 'disc',
        'ul ul&': { listStyleType: 'circle' },
        'ul ul ul&': { listStyleType: 'disc' },
        'ul ul ul ul&': { listStyleType: 'circle' },
        'ul ul ul ul ul&': { listStyleType: 'disc' }, // FIXME: 이게 맞나
      }),
    },
  }),
  OrderedList.configure({
    HTMLAttributes: {
      class: css({
        'paddingLeft': '33px',
        'listStylePosition': 'outside',
        'listStyleType': 'decimal',
        '& li': {
          textIndent: '12px',
        },
      }),
    },
  }),
  ListItem.extend({
    content: 'paragraph (paragraph | bulletList | orderedList)*',
  }),

  // marks
  Bold.configure({ HTMLAttributes: { class: css({ fontWeight: 'bold' }) } }),
  Italic.configure({ HTMLAttributes: { class: css({ fontStyle: 'italic' }) } }),
  Strike.configure({ HTMLAttributes: { class: css({ textDecorationLine: 'line-through' }) } }),
  Underline.configure({ HTMLAttributes: { class: css({ textDecorationLine: 'underline' }) } }),
  Color,
  Code.configure({ HTMLAttributes: { class: css({ fontFamily: 'mono' }) } }),
  Link.configure({
    openOnClick: true,
    HTMLAttributes: {
      class: css({ color: 'text.secondary', textDecorationLine: 'underline', cursor: 'pointer' }),
    },
  }),

  // extensions
  Dropcursor.configure({ width: 4, color: token('colors.accent.30') }),
  ListKeymap,
  Placeholder,
  TextAlign,
  TextStyle,

  Behavior,
  BlockSelectionHelper,
  BubbleMenu,
  FloatingMenu,
  SlashMenu,
  LinkTooltip,
  LinkEditPopover,

  // node views
  Callout,
];

export const schema = getSchema([...extensions, Embed, Image, File]);
