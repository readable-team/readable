import { css } from '@readable/styled-system/css';
import { Extension } from '@tiptap/core';
import { Plugin, PluginKey, Selection } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import type { Range } from '@tiptap/core';
import type { Node } from '@tiptap/pm/model';
import type { Mappable } from '@tiptap/pm/transform';

const key = new PluginKey('blockSelectionHelper');

declare module '@tiptap/core' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Commands<ReturnType> {
    blockSelection: {
      setBlockSelection: (range: Range) => ReturnType;
    };
  }
}

export const BlockSelectionHelper = Extension.create({
  name: 'blockSelectionHelper',

  addCommands() {
    return {
      setBlockSelection:
        (range: Range) =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            const selection = BlockSelection.create(tr.doc, range.from, range.to);
            tr.setSelection(selection);
          }

          return true;
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-a': ({ editor }) => {
        const { $from, $to } = editor.state.selection;

        if ($from.start() === $from.pos && $to.end() === $to.pos) {
          return editor.commands.setBlockSelection({ from: 0, to: editor.state.doc.nodeSize - 2 });
        }

        return editor.commands.setTextSelection({ from: $from.start(), to: $to.end() });
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key,
        props: {
          decorations: ({ doc, selection }) => {
            if (!this.editor.isEditable || !(selection instanceof BlockSelection)) {
              return DecorationSet.empty;
            }

            const { from, to } = selection;
            const decorations: Decoration[] = [];

            doc.descendants((node, pos) => {
              if (node.isInline) {
                return false;
              }

              // const isSelected =
              //   from <= pos + (node.isLeaf ? 0 : 1) && to >= pos + node.nodeSize - (node.isLeaf ? 0 : 1);

              const isSelected = from <= pos && to >= pos + node.nodeSize;

              if (!isSelected) {
                return true;
              }

              decorations.push(
                Decoration.node(pos, pos + node.nodeSize, {
                  class: css({
                    borderRadius: '4px',
                    backgroundColor: '[#b3d4fc]',
                    transition: 'common',
                    transitionTimingFunction: 'ease',
                    willChange: 'background-color',
                  }),
                }),
              );
            });

            return DecorationSet.create(doc, decorations);
          },
        },
      }),
    ];
  },
});

class BlockSelection extends Selection {
  override readonly visible = false;

  override eq(other: Selection) {
    return other instanceof BlockSelection && other.$anchor === this.$anchor && other.$head === this.$head;
  }

  override map(doc: Node, mapping: Mappable): Selection {
    // eslint-disable-next-line unicorn/no-array-callback-reference
    const $head = doc.resolve(mapping.map(this.head));

    if (!$head.parent.inlineContent) {
      return Selection.near($head);
    }

    // eslint-disable-next-line unicorn/no-array-callback-reference
    const $anchor = doc.resolve(mapping.map(this.anchor));

    return new BlockSelection($anchor.parent.inlineContent ? $anchor : $head, $head);
  }

  override toJSON() {
    return { type: 'block', anchor: this.anchor, head: this.head };
  }

  static create(doc: Node, from: number, to: number): BlockSelection {
    return new BlockSelection(doc.resolve(from), doc.resolve(to));
  }
}

try {
  Selection.jsonID('block', BlockSelection);
} catch {
  // ignore
}
