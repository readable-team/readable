import { css } from '@readable/styled-system/css';
import { Blockquote } from '@tiptap/extension-blockquote';
import { Bold } from '@tiptap/extension-bold';
import { BulletList } from '@tiptap/extension-bullet-list';
import { Code } from '@tiptap/extension-code';
import { Color } from '@tiptap/extension-color';
import { Document } from '@tiptap/extension-document';
import { Dropcursor } from '@tiptap/extension-dropcursor';
import { Gapcursor } from '@tiptap/extension-gapcursor';
import { HardBreak } from '@tiptap/extension-hard-break';
import { HorizontalRule } from '@tiptap/extension-horizontal-rule';
import { Italic } from '@tiptap/extension-italic';
import { Link } from '@tiptap/extension-link';
import { ListItem } from '@tiptap/extension-list-item';
import { ListKeymap } from '@tiptap/extension-list-keymap';
import { OrderedList } from '@tiptap/extension-ordered-list';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Strike } from '@tiptap/extension-strike';
import { Text } from '@tiptap/extension-text';
import { TextAlign } from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Underline } from '@tiptap/extension-underline';

export const extensions = [
  // special nodes
  Document,
  Text,

  // nodes
  Paragraph,
  HardBreak,
  HorizontalRule,
  Blockquote.configure({
    HTMLAttributes: { class: css({ borderLeftWidth: '4px', borderLeftColor: 'gray.200', paddingLeft: '16px' }) },
  }),
  BulletList.configure({
    HTMLAttributes: { class: css({ paddingLeft: '16px', listStylePosition: 'outside', listStyleType: 'disc' }) },
  }),
  OrderedList.configure({
    HTMLAttributes: { class: css({ paddingLeft: '16px', listStylePosition: 'outside', listStyleType: 'decimal' }) },
  }),
  ListItem,

  // marks
  Bold.configure({ HTMLAttributes: { class: css({ fontWeight: 'bold' }) } }),
  Italic.configure({ HTMLAttributes: { class: css({ fontStyle: 'italic' }) } }),
  Strike.configure({ HTMLAttributes: { class: css({ textDecorationLine: 'line-through' }) } }),
  Underline.configure({ HTMLAttributes: { class: css({ textDecorationLine: 'underline' }) } }),
  Color,
  Code.configure({ HTMLAttributes: { class: css({ fontFamily: 'mono' }) } }),
  Link.configure({ openOnClick: false }),

  // extensions
  Dropcursor,
  Gapcursor,
  Placeholder.configure({
    emptyNodeClass: css({
      _before: {
        content: 'attr(data-placeholder)',
        float: '[left]',
        height: '0',
        color: 'gray.400',
        pointerEvents: 'none',
      },
    }),
  }),
  ListKeymap,
  TextAlign,
  TextStyle,

  // node views
];
