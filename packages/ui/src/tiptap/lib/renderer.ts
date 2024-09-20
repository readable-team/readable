import { NodeView } from '@tiptap/core';
import { DecorationSet } from '@tiptap/pm/view';
import type {
  DecorationWithType,
  NodeViewProps,
  NodeViewRenderer,
  NodeViewRendererOptions,
  NodeViewRendererProps,
} from '@tiptap/core';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import type { NodeView as ProseMirrorNodeView } from '@tiptap/pm/view';
import type { ComponentType, SvelteComponent } from 'svelte';

type NodeViewComponent = SvelteComponent<NodeViewProps>;
export type NodeViewComponentType = ComponentType<NodeViewComponent>;
export type { NodeViewProps } from '@tiptap/core';

class SvelteNodeView extends NodeView<NodeViewComponentType> implements ProseMirrorNodeView {
  #element: HTMLElement;
  #contentElement: HTMLElement | null = null;
  #component: NodeViewComponent;

  #handleSelectionUpdate: () => void;
  #handleTransaction: () => void;
  #onDragStart: (event: DragEvent) => void;

  constructor(
    component: NodeViewComponentType,
    props: NodeViewRendererProps,
    options?: Partial<NodeViewRendererOptions>,
  ) {
    super(component, props, options);

    this.#onDragStart = (event: DragEvent) => {
      this.onDragStart(event);

      const img = document.createElement('img');
      img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
      document.body.append(img);

      event.dataTransfer?.setDragImage(img, 0, 0);

      setTimeout(() => {
        img.remove();
      }, 0);
    };

    const context = new Map();
    context.set('onDragStart', (event: DragEvent) => this.#onDragStart(event));

    const target = document.createElement('div');
    this.#component = new this.component({
      target,
      props: {
        editor: this.editor,
        view: this.editor.view,
        node: this.node,
        decorations: this.decorations as DecorationWithType[],
        innerDecorations: DecorationSet.empty,
        HTMLAttributes: {},
        extension: this.extension,
        selected: false,

        getPos: () => this.getPos() as number,
        updateAttributes: (attrs) => this.updateAttributes(attrs),
        deleteNode: () => this.deleteNode(),
      },
      context,
    });

    const element = target.querySelector<HTMLElement>('[data-node-view]');
    if (!element) {
      throw new Error('<NodeView /> not found');
    }

    this.#element = element;

    if (!this.node.isLeaf) {
      const contentElement = element.querySelector<HTMLElement>('[data-node-view-content-editable]');
      if (!contentElement) {
        throw new Error('<NodeViewContentEditable /> not found');
      }

      this.#contentElement = contentElement;
    }

    this.#handleSelectionUpdate = () => {
      if (this.node.type.spec.selectable !== false) {
        const { from, to } = this.editor.state.selection;
        const pos = this.getPos();

        if (from <= pos && to >= pos + this.node.nodeSize) {
          this.selectNode();
        } else {
          this.deselectNode();
        }
      }
    };

    this.#handleTransaction = () => {
      this.#component.$set({ editor: this.editor });
    };

    this.editor.on('selectionUpdate', this.#handleSelectionUpdate);
    this.editor.on('transaction', this.#handleTransaction);
  }

  override get dom() {
    return this.#element;
  }

  override get contentDOM() {
    return this.#contentElement;
  }

  // @ts-expect-error type mismatch
  update(node: ProseMirrorNode, decorations: DecorationWithType[]) {
    if (node.type !== this.node.type) {
      return false;
    }

    this.node = node;
    this.decorations = decorations;

    this.#component.$set({ node, decorations });

    return true;
  }

  selectNode() {
    if (this.editor.isEditable && this.node.type.spec.selectable !== false) {
      this.#component.$set({ selected: true });
    }
  }

  deselectNode() {
    if (this.editor.isEditable && this.node.type.spec.selectable !== false) {
      this.#component.$set({ selected: false });
    }
  }

  destroy() {
    this.editor.off('selectionUpdate', this.#handleSelectionUpdate);
    this.editor.off('transaction', this.#handleTransaction);
    this.#component.$destroy();
    this.#contentElement = null;
  }
}

export const SvelteNodeViewRenderer = (
  component: NodeViewComponentType,
  options?: Partial<NodeViewRendererOptions>,
): NodeViewRenderer => {
  return (props) => new SvelteNodeView(component, props, options) as unknown as ProseMirrorNodeView;
};
