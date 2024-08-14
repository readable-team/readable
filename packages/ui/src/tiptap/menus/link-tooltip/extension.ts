import { autoUpdate, computePosition } from '@floating-ui/dom';
import { center } from '@readable/styled-system/patterns';
import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import LinkEditModal from '../link-edit-modal/Component.svelte';
import Component from './Component.svelte';
import type { Node } from '@tiptap/pm/model';

type State = {
  pos: number;
  anchorNode: Node | null;
};

const key = new PluginKey<State>('linkTooltip');

export const LinkTooltip = Extension.create({
  name: 'linkTooltip',

  addProseMirrorPlugins() {
    return [
      new Plugin<State>({
        key,
        props: {
          handleDOMEvents: {
            pointermove: (view, event) => {
              const target = event.target as HTMLElement;

              if (target.nodeName === 'A') {
                const pos = view.posAtDOM(target, 0);
                const node = view.state.doc.nodeAt(pos);

                if (node) {
                  const { tr } = view.state;
                  tr.setMeta(key, { anchorNode: node, pos });
                  view.dispatch(tr);
                  return;
                }
              }

              const { tr } = view.state;
              tr.setMeta(key, { anchorNode: null, pos: -1 });
              view.dispatch(tr);
            },
          },
        },
        state: {
          init: () => ({ anchorNode: null, pos: -1 }),
          apply: (tr, value) => {
            const meta = tr.getMeta(key);
            if (meta) {
              return meta;
            }

            return value;
          },
        },
        view: () => {
          const dom = document.createElement('div');
          let cleanup: (() => void) | undefined;

          const hideTooltip = () => {
            dom.style.visibility = 'hidden';
            cleanup?.();
          };

          let tooltipComponent: Component | null = null;

          return {
            update: async (view, oldState) => {
              const state = key.getState(view.state);
              const prevState = key.getState(oldState);

              if (!state || state.anchorNode === prevState?.anchorNode) {
                return;
              }

              const { anchorNode, pos } = state;

              if (!anchorNode) {
                hideTooltip();
                return;
              }

              const coordsAtPos = view.coordsAtPos(pos);

              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              const element = document.elementFromPoint(coordsAtPos.left, coordsAtPos.top)!;

              const linkHref = anchorNode.marks.find((mark) => mark.type.name === 'link')?.attrs.href;

              const openLinkEditModal = () => {
                hideTooltip();

                const modalDom = document.createElement('div');
                const modalComponent = new LinkEditModal({
                  target: modalDom,
                  props: {
                    editor: this.editor,
                    from: pos,
                    to: pos + anchorNode.nodeSize,
                    referenceElement: element,
                    defaultLink: linkHref,
                    onClose: () => {
                      modalComponent.$destroy();
                      modalDom.remove();
                    },
                  },
                });

                document.body.append(modalDom);
              };

              if (!tooltipComponent) {
                tooltipComponent = new Component({
                  target: dom,
                  props: {
                    hide: hideTooltip,
                    linkHref,
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

              tooltipComponent.$set({ linkHref, openLinkEditModal });

              cleanup?.();
              cleanup = autoUpdate(element, dom, async () => {
                const { x, y } = await computePosition(element, dom, {
                  placement: 'bottom-start',
                });

                dom.style.left = `${x}px`;
                dom.style.top = `${y}px`;
              });

              dom.style.visibility = 'visible';
            },
            destroy: () => {
              hideTooltip();
              tooltipComponent?.$destroy();
              dom.remove();
            },
          };
        },
      }),
    ];
  },
});
