import { createServerNodeView } from '../../lib/server';

export const Embed = createServerNodeView({
  name: 'embed',
  group: 'block',
  draggable: true,

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
});
