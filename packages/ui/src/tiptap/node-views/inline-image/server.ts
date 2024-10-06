import { createServerNodeView } from '../../lib/server';

export const InlineImage = createServerNodeView({
  name: 'inlineImage',
  group: 'inline',
  inline: true,
  draggable: true,

  addAttributes() {
    return {
      id: {},
      url: {},
      ratio: {},
      placeholder: {},
    };
  },
});
