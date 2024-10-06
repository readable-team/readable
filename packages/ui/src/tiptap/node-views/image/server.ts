import { createServerNodeView } from '../../lib/server';

export const Image = createServerNodeView({
  name: 'image',
  group: 'block',
  draggable: true,

  addAttributes() {
    return {
      id: {},
      url: {},
      ratio: {},
      placeholder: {},
      proportion: { default: 1 },
    };
  },
});
