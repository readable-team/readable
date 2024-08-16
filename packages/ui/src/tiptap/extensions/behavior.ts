import { Extension } from '@tiptap/core';
import { Plugin } from '@tiptap/pm/state';

export const Behavior = Extension.create({
  name: 'behavior',

  addKeyboardShortcuts() {
    return {
      Backspace: ({ editor }) => {
        const { selection } = editor.state;
        const { $anchor, empty } = selection;

        if (empty && $anchor.parent.isTextblock && $anchor.parent.childCount === 0 && $anchor.parentOffset === 0) {
          const pos = $anchor.before(1);
          const block = $anchor.node(1);

          if (!['paragraph', 'bulletList', 'orderedList'].includes(block.type.name)) {
            return editor
              .chain()
              .setNodeSelection(pos)
              .deleteSelection()
              .insertContentAt(pos, { type: 'paragraph' })
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
