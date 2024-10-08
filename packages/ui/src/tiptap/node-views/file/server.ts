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

  parseHTML() {
    return [
      { tag: `node-view[data-node-view-type=${this.name}]` },
      // gitbook file
      {
        tag: 'div',
        getAttrs: (node) => {
          const anchor = node.querySelector('> a');
          if (!anchor) {
            return false;
          }

          const svg = anchor.querySelector('> div:nth-child(1) > div:nth-child(1) > svg');
          if (!svg) {
            return false;
          }

          const style = svg.getAttribute('style');
          if (!style) {
            return false;
          }

          if (!style.includes('file-download.svg')) {
            return false;
          }

          const name = anchor.querySelector('> div:nth-child(2) > div:nth-child(1)');
          if (!name) {
            return false;
          }

          return {
            name: name.textContent,
            url: anchor.getAttribute('href'),
          };
        },
      },
    ];
  },
});
