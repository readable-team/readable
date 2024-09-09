import { createNodeView } from '../../lib';
import Component from './Component.svelte';

declare module '@tiptap/core' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Commands<ReturnType> {
    embed: {
      setEmbed: () => ReturnType;
    };
  }
}

type Options = {
  handleEmbed: (url: string) => Promise<Record<string, unknown>>;
};

export const Embed = createNodeView<Options>(Component, {
  name: 'embed',
  group: 'block',
  draggable: true,

  addOptions() {
    return {
      handleEmbed: async () => ({}),
    };
  },

  addAttributes() {
    return {
      id: {},
      url: {},
      title: {},
      description: {},
      thumbnailUrl: {},
      html: {},
    };
  },

  addCommands() {
    return {
      setEmbed:
        () =>
        ({ commands }) => {
          return commands.insertContent({ type: 'embed' });
        },
    };
  },
});
