import { Extension } from '@tiptap/core';
import { Plugin } from '@tiptap/pm/state';

export const Behavior = Extension.create({
  name: 'behavior',

  addKeyboardShortcuts() {
    return {
      Backspace: ({ editor }) => {
        const { doc, selection } = editor.state;
        const { $anchor, empty } = selection;

        const pos = $anchor.before(1);
        const block = $anchor.node(1);

        if (empty && $anchor.parent.isTextblock && $anchor.parent.childCount === 0 && $anchor.parentOffset === 0) {
          if (!['paragraph', 'bulletList', 'orderedList'].includes(block.type.name) && block.childCount === 0) {
            return editor
              .chain()
              .setNodeSelection(pos)
              .deleteSelection()
              .insertContentAt(pos, { type: 'paragraph' })
              .run();
          }

          const blockBefore = doc.childBefore(pos).node;
          if (block.childCount === 0 && blockBefore?.isTextblock && blockBefore.childCount === 0) {
            return editor
              .chain()
              .setNodeSelection(pos)
              .deleteSelection()
              .setTextSelection(pos - 1)
              .run();
          }
        }

        return false;
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          handleClick: (view, pos) => {
            const { state } = view;

            const endOfDocument = pos === state.doc.content.size;
            const lastChildEmptyParagraph =
              state.doc.lastChild?.type.name === 'paragraph' && state.doc.lastChild?.childCount === 0;

            if (endOfDocument && !lastChildEmptyParagraph) {
              this.editor.chain().insertContentAt(pos, { type: 'paragraph' }).run();
            }
          },
        },
      }),
    ];
  },
});
