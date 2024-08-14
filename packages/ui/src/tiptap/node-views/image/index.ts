import { createNodeView } from '../../lib';
import Component from './Component.svelte';

declare module '@tiptap/core' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Commands<ReturnType> {
    image: {
      setImage: () => ReturnType;
    };
  }
}

type Options = {
  handleImageUpload: (file: File) => Promise<Record<string, unknown>>;
};

export const Image = createNodeView<Options>(Component, {
  name: 'image',
  group: 'block',

  addOptions() {
    return {
      handleImageUpload: async () => ({}),
    };
  },

  addAttributes() {
    return {
      id: {},
      url: {},
      placeholder: {},
    };
  },

  addCommands() {
    return {
      setImage:
        () =>
        ({ commands }) => {
          return commands.insertContent({ type: 'image' });
        },
    };
  },
});
