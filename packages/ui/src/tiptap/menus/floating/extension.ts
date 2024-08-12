import { autoUpdate, computePosition, offset } from '@floating-ui/dom';
import { center } from '@readable/styled-system/patterns';
import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import Component from './Component.svelte';

type State = {
  pos: number;
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
              if (!(event.target instanceof Element)) {
                return;
              }

              const posAtCoords = view.posAtCoords({ left: event.clientX, top: event.clientY });

              const { tr } = view.state;

              if (posAtCoords) {
                const $pos = view.state.doc.resolve(posAtCoords.pos);
                const pos = $pos.start(1);

                if (pos > view.state.doc.content.size) {
                  tr.setMeta(key, { pos: -1 });
                } else {
                  tr.setMeta(key, { pos });
                }
              } else {
                tr.setMeta(key, { pos: -1 });
              }

              view.dispatch(tr);
            },
          },
        },
        state: {
          init: () => ({ pos: -1 }),
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

          dom.className = center({
            position: 'absolute',
            top: '0',
            left: '0',
            width: 'max',
            visibility: 'hidden',
            translate: 'auto',
            translateY: '-1/2',
          });

          document.body.append(dom);

          let cleanup: (() => void) | undefined;

          return {
            update: async (view, oldState) => {
              const state = key.getState(view.state);
              const prevState = key.getState(oldState);

              if (!state || state.pos === prevState?.pos) {
                return;
              }

              const { pos } = state;

              if (pos === -1) {
                dom.style.visibility = 'hidden';
                return;
              }

              const $pos = view.state.doc.resolve(pos);
              const node = $pos.node();

              component.$set({ pos, node });

              const coordsAtPos = view.coordsAtPos(pos, -1);
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              const element = document
                .elementsFromPoint(coordsAtPos.left, coordsAtPos.top)
                .find((element) => element.parentElement === view.dom)!;

              cleanup?.();
              cleanup = autoUpdate(element, dom, async () => {
                const { x, y } = await computePosition(element, dom, {
                  placement: 'left-start',
                  middleware: [offset(8)],
                });

                const style = window.getComputedStyle(element);
                const lineHeight = Number.parseInt(style.lineHeight, 10) || Number.parseInt(style.fontSize, 10) * 1.5;

                const effectiveX = x;
                const effectiveY = y + lineHeight / 2;

                dom.style.visibility = 'visible';
                dom.style.left = `${effectiveX}px`;
                dom.style.top = `${effectiveY}px`;
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
