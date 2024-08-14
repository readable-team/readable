import { Extension } from '@tiptap/core';

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
});
