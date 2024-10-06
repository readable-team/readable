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
});
