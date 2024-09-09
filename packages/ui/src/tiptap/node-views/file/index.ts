import { createNodeView } from '../../lib';
import Component from './Component.svelte';

declare module '@tiptap/core' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Commands<ReturnType> {
    file: {
      setFile: () => ReturnType;
    };
  }
}

type Options = {
  handleFileUpload: (file: File) => Promise<Record<string, unknown>>;
};

export const File = createNodeView<Options>(Component, {
  name: 'file',
  group: 'block',
  draggable: true,

  addOptions() {
    return {
      handleFileUpload: async () => ({}),
    };
  },

  addAttributes() {
    return {
      id: {},
      name: {},
      size: {},
      url: {},
    };
  },

  addCommands() {
    return {
      setFile:
        () =>
        ({ commands }) => {
          return commands.insertContent({ type: 'file' });
        },
    };
  },
});
