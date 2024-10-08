import { createServerNodeView } from '../../lib/server';

export const File = createServerNodeView({
  name: 'file',
  group: 'block',
  draggable: true,

  addAttributes() {
    return {
      id: {},
      name: {},
      size: {},
      url: {},
    };
  },
});
