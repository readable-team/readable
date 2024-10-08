import { createServerNodeView } from '../../lib/server';

export const Image = createServerNodeView({
  name: 'image',
  group: 'block',
  draggable: true,

  addAttributes() {
    return {
      id: {},
      url: { parseHTML: (element) => element.getAttribute('src') },
      ratio: {},
      placeholder: {},
      proportion: { default: 1 },
    };
  },

  parseHTML() {
    return [
      { tag: `node-view[data-node-view-type=${this.name}]` },
      { tag: 'img' },
      // gitbook image
      {
        tag: 'div',
        getAttrs: (node) => {
          const img = node.querySelector('> div > img');
          if (!img) {
            return false;
          }

          const src = img.getAttribute('src');
          if (!src) {
            return false;
          }

          const srcUrl = new URL(src);
          const url = srcUrl.searchParams.get('url');

          return {
            url,
          };
        },
      },
    ];
  },
});
