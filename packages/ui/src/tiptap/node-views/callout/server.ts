import { createServerNodeView } from '../../lib/server';

export const Callout = createServerNodeView({
  name: 'callout',
  group: 'block',
  content: 'paragraph+',
  defining: true,

  addAttributes() {
    return {
      emoji: { isRequired: true, default: 'alert' },
    };
  },
});
