import { computePosition } from '@floating-ui/dom';
import { Extension } from '@tiptap/core';
import { Suggestion } from '@tiptap/suggestion';
import { matchSorter } from 'match-sorter';
import Component from './Component.svelte';
import { menuItems } from './items';
import type { VirtualElement } from '@floating-ui/dom';

export const SlashMenu = Extension.create({
  name: 'slashMenu',

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        char: '/',
        startOfLine: true,

        items: ({ query }) => {
          return matchSorter(menuItems, query, {
            keys: ['name', 'keywords'],
            sorter: (items) => items,
          });
        },

        render: () => {
          let dom: HTMLElement | null = null;
          let component: Component | null = null;

          return {
            onStart: async ({ clientRect, editor, range, items }) => {
              dom = document.createElement('div');
              component = new Component({
                target: dom,
                props: {
                  editor,
                  range,
                  items,
                },
              });

              const domRect = clientRect?.();

              if (!domRect) {
                return;
              }

              const virtualEl: VirtualElement = {
                getBoundingClientRect: () => domRect,
              };

              const { x, y } = await computePosition(virtualEl, dom, {
                placement: 'bottom-start',
              });

              dom.style.position = 'absolute';
              dom.style.left = `${x}px`;
              dom.style.top = `${y}px`;

              document.body.append(dom);
              editor.view.dom.classList.add('has-slash-menu');
            },

            onUpdate: ({ editor, range, items }) => {
              component?.$set({ editor, range, items, selectedIdx: 0 });
            },

            onKeyDown: ({ event, view }) => {
              if (event.key === 'Escape') {
                view.dom.classList.remove('has-slash-menu');
                component?.$destroy();
                dom?.remove();

                return true;
              }

              return component?.handleKeyDown?.(event) ?? false;
            },

            onExit: ({ editor }) => {
              editor.view.dom.classList.remove('has-slash-menu');
              component?.$destroy();
              dom?.remove();
            },
          };
        },
      }),
    ];
  },
});
