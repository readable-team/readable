import { createServerNodeView } from '../../lib/server';

export const CodeBlock = createServerNodeView({
  name: 'codeBlock',
  group: 'block',
  draggable: true,
  content: 'text*',
  marks: '',
  code: true,
  defining: true,
  isolating: true,

  renderText: () => '',

  addAttributes() {
    return {
      language: { default: 'text' },
    };
  },
});
