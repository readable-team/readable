import { createNodeView } from '../../lib';
import Component from './Component.svelte';

declare module '@tiptap/core' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Commands<ReturnType> {
    callout: {
      setCallout: () => ReturnType;
      toggleCallout: () => ReturnType;
      unsetCallout: () => ReturnType;
    };
  }
}

export const Callout = createNodeView(Component, {
  name: 'callout',
  group: 'block',
  content: 'paragraph+',
  draggable: true,
  defining: true,

  addAttributes() {
    return {
      emoji: { isRequired: true, default: 'alert' },
    };
  },

  addCommands() {
    return {
      setCallout:
        () =>
        ({ commands }) => {
          return commands.wrapIn(this.name);
        },
      toggleCallout:
        () =>
        ({ commands }) => {
          return commands.toggleWrap(this.name);
        },
      unsetCallout:
        () =>
        ({ commands }) => {
          return commands.lift(this.name);
        },
    };
  },
});
