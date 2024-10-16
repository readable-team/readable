import { css } from '@readable/styled-system/css';
import { Extension, findParentNode } from '@tiptap/core';
import { Plugin } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { match } from 'ts-pattern';

export const Placeholder = Extension.create({
  name: 'placeholder',
  priority: 1000,

  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          decorations: (state) => {
            if (!this.editor.isEditable) {
              return null;
            }

            const decorations: Decoration[] = [];
            const { doc, selection } = state;
            const { $anchor, empty } = selection;

            const currentDocumentEmpty =
              doc.childCount === 1 && doc.firstChild?.type.name === 'paragraph' && doc.firstChild?.childCount === 0;

            const currentParagraphEmpty =
              this.editor.isFocused &&
              empty &&
              $anchor.depth === 1 &&
              $anchor.parent.type.name === 'paragraph' &&
              $anchor.parent.childCount === 0;

            // NOTE: 어째선지 탭 전환 시에는 동작하지 않는다
            const currentTabPanelEmpty =
              this.editor.isFocused &&
              empty &&
              findParentNode((node) => node.type.name === 'tab')(selection) &&
              $anchor.parent.type.name === 'paragraph' &&
              $anchor.parent.childCount === 0;

            if (currentDocumentEmpty || currentParagraphEmpty || currentTabPanelEmpty) {
              decorations.push(
                createDecoration(
                  $anchor.pos === 0 ? 0 : $anchor.before(),
                  $anchor.pos === 0 ? 2 : $anchor.after(),
                  '내용을 입력하거나 /를 입력해 블록 삽입하기...',
                ),
              );
            }

            doc.descendants((node, pos) => {
              if (!node.isTextblock || node.childCount > 0) {
                return;
              }

              const $pos = doc.resolve(pos + 1);
              const block = $pos.node(1);
              if (!block) {
                return;
              }

              const placeholder = match(block.type.name)
                .with('heading', () => `제목 ${block.attrs.level}`)
                .with('blockquote', () => '인용구')
                .with('bulletList', 'orderedList', () => '목록')
                .with('callout', () => '콜아웃')
                .with('hint', () => '힌트')
                .otherwise(() => null);

              if (!placeholder) {
                return;
              }

              decorations.push(createDecoration(pos, pos + node.nodeSize, placeholder));
            });

            return DecorationSet.create(doc, decorations);
          },
        },
      }),
    ];
  },
});

const createDecoration = (from: number, to: number, placeholder: string) => {
  return Decoration.node(from, to, {
    class: css({
      _before: {
        content: 'attr(data-placeholder)',
        float: '[left]',
        height: '0',
        color: 'neutral.50',
        pointerEvents: 'none',
      },
    }),
    'data-placeholder': placeholder,
  });
};
