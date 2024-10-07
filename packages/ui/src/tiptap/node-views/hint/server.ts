import { match } from 'ts-pattern';
import { createServerNodeView } from '../../lib/server';

export const Hint = createServerNodeView({
  name: 'hint',
  group: 'block',
  content: '(paragraph|orderedList|bulletList|image|file|embed)+',
  defining: true,

  addAttributes() {
    return {
      type: { default: 'info' },
    };
  },

  parseHTML() {
    return [
      { tag: `node-view[data-node-view-type=${this.name}]` },
      // gitbook hint
      {
        tag: 'div',
        getAttrs: (node) => {
          const svg = node.querySelector('> div:nth-child(1) > div:nth-child(1) > svg');
          if (!svg) {
            return false;
          }

          const style = svg.getAttribute('style');
          if (!style) {
            return false;
          }

          const icon = style.match(/\/([^/]+)\.svg/)?.[1];
          const type = match(icon)
            .with('circle-info', () => 'info')
            .with('circle-check', () => 'success')
            .with('circle-exclamation', () => 'warning')
            .with('triangle-exclamation', () => 'danger')
            .otherwise(() => null);

          if (!type) {
            return false;
          }

          return { type };
        },
        contentElement: '> div:nth-child(1) > div:nth-child(2)',
      },
    ];
  },
});
