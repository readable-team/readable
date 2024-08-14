import { autoUpdate, computePosition, hide, inline, offset, shift } from '@floating-ui/dom';
import { center } from '@readable/styled-system/patterns';
import { Extension, posToDOMRect } from '@tiptap/core';
import { NodeSelection, Plugin, PluginKey, TextSelection } from '@tiptap/pm/state';
import { isValidUrl } from '../../../utils/url';
import { BlockSelection } from '../../extensions/block-selection';
import LinkEditModal from '../link-edit-modal/Component.svelte';
import Component from './Component.svelte';
import type { VirtualElement } from '@floating-ui/dom';

type State = {
  pos: number;
};

const key = new PluginKey<State>('bubbleMenu');

export const BubbleMenu = Extension.create({
  name: 'bubbleMenu',

  addProseMirrorPlugins() {
    return [
      new Plugin<State>({
        key,
        view: () => {
          const dom = document.createElement('div');
          let cleanup: (() => void) | undefined;

          const hideBubble = () => {
            dom.style.visibility = 'hidden';
            cleanup?.();
          };

          let bubbleComponent: Component | null = null;

          return {
            update: async (view, oldState) => {
              const selectionChanged = !oldState.selection.eq(view.state.selection);
              const docChanged = !oldState.doc.eq(view.state.doc);

              if (!selectionChanged && !docChanged) {
                return;
              }

              const { selection } = view.state;

              if (
                selection.empty ||
                selection.from === selection.to ||
                selection instanceof BlockSelection ||
                view.composing
              ) {
                hideBubble();
                return;
              }

              const element: VirtualElement = {
                getBoundingClientRect: () => {
                  if (selection instanceof NodeSelection) {
                    const node = view.nodeDOM(selection.from) as HTMLElement;
                    return node.getBoundingClientRect();
                  } else {
                    return posToDOMRect(view, selection.from, selection.to);
                  }
                },
                getClientRects: () => {
                  if (selection instanceof NodeSelection) {
                    const node = view.nodeDOM(selection.from) as HTMLElement;
                    return node.getClientRects();
                  } else if (selection instanceof TextSelection) {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    return window.getSelection()!.getRangeAt(0).getClientRects();
                  } else {
                    return [posToDOMRect(view, selection.from, selection.to)];
                  }
                },
                contextElement: view.dom,
              };

              const openLinkEditModal = () => {
                hideBubble();

                const { from, to } = selection;
                let defaultLink = '';

                const currentLink = this.editor.getAttributes('link');
                if (currentLink.href) {
                  defaultLink = currentLink.href;
                } else {
                  const maybeLink = this.editor.state.doc.textBetween(from, to);
                  if (isValidUrl(maybeLink)) {
                    defaultLink = maybeLink;
                  }
                }

                const modalDom = document.createElement('div');
                const modalComponent = new LinkEditModal({
                  target: modalDom,
                  props: {
                    editor: this.editor,
                    from: selection.from,
                    to: selection.to,
                    referenceElement: element as HTMLElement,
                    defaultLink,
                    onClose: () => {
                      modalComponent.$destroy();
                      modalDom.remove();
                    },
                  },
                });

                document.body.append(modalDom);
              };

              if (!bubbleComponent) {
                bubbleComponent = new Component({
                  target: dom,
                  props: {
                    editor: this.editor,
                    openLinkEditModal,
                  },
                });

                dom.className = center({
                  position: 'absolute',
                  top: '0',
                  left: '0',
                  width: 'max',
                  visibility: 'hidden',
                });

                document.body.append(dom);
              }

              bubbleComponent.$set({ from: selection.from, to: selection.to, openLinkEditModal });

              cleanup?.();
              cleanup = autoUpdate(element, dom, async () => {
                const { x, y, middlewareData } = await computePosition(element, dom, {
                  placement: 'top-start',
                  middleware: [
                    offset({ mainAxis: 8, crossAxis: -16 }),
                    inline(),
                    shift({ mainAxis: false, crossAxis: true, altBoundary: true, padding: 8 }),
                    hide({ padding: -8 }),
                  ],
                });

                if (middlewareData.hide) {
                  dom.style.visibility = middlewareData.hide.referenceHidden ? 'hidden' : 'visible';
                }

                dom.style.left = `${x}px`;
                dom.style.top = `${y}px`;
              });

              dom.style.visibility = 'visible';
            },
            destroy: () => {
              hideBubble();
              bubbleComponent?.$destroy();
              dom.remove();
            },
          };
        },
      }),
    ];
  },
});
