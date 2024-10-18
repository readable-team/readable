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
              const posAtCoords = view.posAtCoords({ left: event.clientX, top: event.clientY });
              const pos = posAtCoords ? (posAtCoords.inside === -1 ? posAtCoords.pos : posAtCoords.inside) : -1;

              const { tr } = view.state;

              if (pos === -1) {
                tr.setMeta(key, { pos: -1 });
              } else {
                const $pos = view.state.doc.resolve(pos);
                tr.setMeta(key, { pos: $pos.before(1) });
              }

              view.dispatch(tr);
            },
            wheel: (view) => {
              const { tr } = view.state;
              tr.setMeta(key, { pos: -1 });
              view.dispatch(tr);
            },
            keydown: (view) => {
              const { tr } = view.state;
              tr.setMeta(key, { pos: -1 });
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

              const node = view.state.doc.nodeAt(pos);
              if (!node) {
                dom.style.visibility = 'hidden';
                return;
              }

              component.$set({ pos, node });

              const coordsAtPos = view.coordsAtPos(pos, 0);
              let element = document.elementFromPoint(coordsAtPos.left, coordsAtPos.top);

              while (element !== null && element.parentElement !== view.dom) {
                element = element.parentElement;
              }

              if (!element) {
                dom.style.visibility = 'hidden';
                return;
              }

              cleanup?.();
              cleanup = autoUpdate(element, dom, async () => {
                const style = window.getComputedStyle(element);
                const marginLeft = Number.parseFloat(style.marginLeft) || 0;
                const paddingLeft = Number.parseFloat(style.paddingLeft) || 0;
                const paddingTop = Number.parseFloat(style.paddingTop) || 0;
                const scrollLeft = element.scrollLeft;
                const lineHeight = Number.parseFloat(style.lineHeight) || Number.parseFloat(style.fontSize) * 1.5;

                const { x, y } = await computePosition(element, dom, {
                  placement: 'left-start',
                  middleware: [offset(8 + marginLeft)],
                });

                const effectiveX = x + paddingLeft - scrollLeft;
                const effectiveY = y + lineHeight / 2 + paddingTop;

                dom.style.left = `${effectiveX}px`;
                dom.style.top = `${effectiveY}px`;
              });

              dom.style.visibility = 'visible';
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
