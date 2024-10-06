import { createNodeView } from '../../lib';
import Component from './Component.svelte';

declare module '@tiptap/core' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Commands<ReturnType> {
    inlineImage: {
      setInlineImage: () => ReturnType;
    };
  }
}

type Options = {
  handleImageUpload: (file: File) => Promise<Record<string, unknown>>;
};

export const InlineImage = createNodeView<Options>(Component, {
  name: 'inlineImage',
  group: 'inline',
  inline: true,
  draggable: true,

  addOptions() {
    return {
      handleImageUpload: async () => ({}),
    };
  },

  addAttributes() {
    return {
      id: {},
      url: {},
      ratio: {},
      placeholder: {},
    };
  },

  addCommands() {
    return {
      setInlineImage:
        () =>
        ({ commands }) => {
          return commands.insertContent({ type: 'inlineImage' });
        },
    };
  },
});
