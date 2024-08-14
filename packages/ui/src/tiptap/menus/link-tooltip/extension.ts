import { autoUpdate, computePosition } from '@floating-ui/dom';
import { center } from '@readable/styled-system/patterns';
import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
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

          const exit = () => {
            dom.style.visibility = 'hidden';
            cleanup?.();
          };

          const component = new Component({
            target: dom,
            props: {
              editor: this.editor,
              exit,
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

          return {
            update: async (view, oldState) => {
              const state = key.getState(view.state);
              const prevState = key.getState(oldState);

              if (!state || state.anchorNode === prevState?.anchorNode) {
                return;
              }

              const { anchorNode, pos } = state;

              if (!anchorNode) {
                exit();
                return;
              }

              component.$set({ anchorNode, pos, linkEditModalOpened: false });

              const coordsAtPos = view.coordsAtPos(pos);

              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              const element = document.elementFromPoint(coordsAtPos.left, coordsAtPos.top)!;

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
          };
        },
      }),
    ];
  },
});
