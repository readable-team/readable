import { createNodeView } from '../../lib';
import Component from './Component.svelte';

declare module '@tiptap/core' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Commands<ReturnType> {
    hint: {
      setHint: () => ReturnType;
      toggleHint: () => ReturnType;
      unsetHint: () => ReturnType;
    };
  }
}

export const Hint = createNodeView(Component, {
  name: 'hint',
  group: 'block',
  content: '(paragraph|orderedList|bulletList|image|file|embed)+',
  defining: true,

  addAttributes() {
    return {
      type: { default: 'info' },
    };
  },

  addCommands() {
    return {
      setHint:
        () =>
        ({ commands }) => {
          return commands.wrapIn(this.name);
        },
      toggleHint:
        () =>
        ({ commands }) => {
          return commands.toggleWrap(this.name);
        },
      unsetHint:
        () =>
        ({ commands }) => {
          return commands.lift(this.name);
        },
    };
  },
});
