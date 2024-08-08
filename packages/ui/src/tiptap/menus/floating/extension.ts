import { autoUpdate, computePosition, offset } from '@floating-ui/dom';
import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import Component from './Component.svelte';

type State = {
  pos: number;
  index: number;
};

const key = new PluginKey<State>('floatingMenu');

export const FloatingMenu = Extension.create({
  name: 'floatingMenu',

  addProseMirrorPlugins() {
    return [
      new Plugin<State>({
        key,
        props: {
          handleDOMEvents: {
            pointermove: (view, event) => {
              if (!(event.target instanceof Node)) {
                return;
              }

              // const rect = view.dom.getBoundingClientRect();

              // const left = Math.max(event.clientX, rect.x);
              const left = event.clientX;
              const top = event.clientY;

              const pos = view.posAtCoords({ left, top });

              const { tr } = view.state;

              if (pos) {
                const $pos = view.state.doc.resolve(pos.pos);
                tr.setMeta(key, { pos: $pos.start(1), index: $pos.index(0) });
              } else {
                tr.setMeta(key, { pos: -1, index: -1 });
              }

              view.dispatch(tr);
            },
          },
        },
        state: {
          init: () => ({ pos: -1, index: -1 }),
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
          const component = new Component({
            target: dom,
            props: {
              editor: this.editor,
            },
          });

          dom.style.position = 'absolute';
          dom.style.width = 'max-content';
          dom.style.top = '0';
          dom.style.left = '0';

          document.body.append(dom);

          let cleanup: (() => void) | undefined;

          return {
            update: async (view, oldState) => {
              const state = key.getState(view.state);
              const prevState = key.getState(oldState);

              if (!state || state.index === prevState?.index) {
                return;
              }

              const { pos, index } = state;
              if (pos === -1) {
                dom.style.visibility = 'hidden';
                return;
              }

              const node = view.state.doc.maybeChild(index);
              if (!node) {
                dom.style.visibility = 'hidden';
                return;
              }

              component.$set({ pos, node });

              const element = view.domAtPos(pos) as { node: HTMLElement; offset: number };

              cleanup?.();
              cleanup = autoUpdate(element.node, dom, async () => {
                const { x, y } = await computePosition(element.node, dom, {
                  placement: 'left-start',
                  middleware: [offset({ mainAxis: 8, crossAxis: 4 })],
                });

                dom.style.visibility = 'visible';
                dom.style.left = `${x}px`;
                dom.style.top = `${y}px`;
              });
            },
            destroy: () => {
              cleanup?.();
              component.$destroy();
              dom.remove();
            },
          };
        },
      }),
    ];
  },
});
