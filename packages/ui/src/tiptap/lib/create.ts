import { mergeAttributes, Node } from '@tiptap/core';
import { browser } from '$app/environment';
import { SvelteNodeViewRenderer } from './renderer';
import type { NodeConfig } from '@tiptap/core';
import type { NodeViewComponentType } from './renderer';

type CreateNodeViewOptions<Options, Storage> = NodeConfig<Options, Storage>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createNodeView = <Options = any, Storage = any>(
  component: NodeViewComponentType,
  options: CreateNodeViewOptions<Options, Storage>,
) => {
  return Node.create<Options, Storage>({
    ...options,

    parseHTML() {
      return [{ tag: 'node-view' }];
    },

    renderHTML({ node, HTMLAttributes }) {
      if (browser) {
        return node.isLeaf ? ['node-view', HTMLAttributes] : ['node-view', HTMLAttributes, 0];
      } else {
        // @ts-expect-error svelte internal
        const { html } = component.render({
          node,
          extension: this,
          selected: false,
        });

        // prosemirror-model이 ssr시에 zeed-dom을 이용하고, zeed-dom은 html attribute를 특별하게 처리하는 로직이 있어
        // html attribute에 들어간 값을 innerHTML에 그대로 렌더링함. 아래 코드는 해당 동작에 의존함 (문서화되지 않은 기능 / 편법에 가까움)
        // https://github.com/holtwick/zeed-dom/blob/6a2d6694ed879da9444d9b7c1826cef4b23c8a17/src/html.ts#L139-L140
        if (node.isLeaf) {
          return [
            'node-view',
            mergeAttributes(HTMLAttributes, { html, style: 'display: block; white-space: normal;' }),
          ];
        } else {
          return [
            'node-view',
            mergeAttributes(HTMLAttributes, { html, style: 'display: block; white-space: normal;' }),
            ['node-view-content-editable', { style: 'display: block; white-space: normal;' }, 0],
          ];
        }
      }
    },

    addNodeView() {
      return SvelteNodeViewRenderer(component);
    },
  });
};
