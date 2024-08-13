import { computePosition, flip } from '@floating-ui/dom';
import { css } from '@readable/styled-system/css';
import { Extension } from '@tiptap/core';
import { Suggestion } from '@tiptap/suggestion';
import { disassemble } from 'es-hangul';
import { matchSorter } from 'match-sorter';
import Component from './Component.svelte';
import { menuItems } from './items';
import type { VirtualElement } from '@floating-ui/dom';
import type { MenuItem } from './types';

const pattern = /^\/(.*)$/;

export const SlashMenu = Extension.create({
  name: 'slashMenu',

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        char: '/',
        startOfLine: true,
        findSuggestionMatch: ({ $position }) => {
          const node = $position.node();
          const text = node.textContent;

          const match = text.match(pattern);
          if (!match) {
            return null;
          }

          return {
            text: match[0],
            query: match[1],
            range: {
              from: $position.start(),
              to: $position.end(),
            },
          };
        },

        allow: ({ state }) => {
          const { selection } = state;
          const { $from } = selection;
          return $from.depth === 1;
        },

        items: ({ query }) => {
          return matchSorter(menuItems, disassemble(query), {
            keys: [(item) => disassemble(item.name), (item) => item.keywords.map((v) => disassemble(v))],
            sorter: (items) => items,
          });
        },

        render: () => {
          let dom: HTMLElement | null = null;
          let component: Component | null = null;
          let selectedItem: MenuItem | null = null;

          return {
            onStart: async ({ clientRect, editor, range, items }) => {
              selectedItem = items[0];
              dom = document.createElement('div');
              component = new Component({
                target: dom,
                props: {
                  editor,
                  range,
                  items,
                },
              });

              dom.className = css({
                position: 'absolute',
                top: '0',
                left: '0',
                width: 'max',
                visibility: 'hidden',
              });

              component.$on('select', (event) => {
                selectedItem = event.detail;
              });

              const domRect = clientRect?.();

              if (!domRect) {
                return;
              }

              const virtualEl: VirtualElement = {
                getBoundingClientRect: () => domRect,
              };

              document.body.append(dom);

              const { x, y } = await computePosition(virtualEl, dom, {
                placement: 'bottom-start',
                middleware: [
                  flip({
                    padding: 16,
                  }),
                ],
              });

              dom.style.position = 'absolute';
              dom.style.left = `${x}px`;
              dom.style.top = `${y}px`;
              dom.style.visibility = 'visible';

              editor.view.dom.classList.add('has-slash-menu');
            },

            onUpdate: ({ editor, range, items }) => {
              selectedItem = items[0];
              component?.$set({ editor, range, items, selectedIdx: 0 });
            },

            onKeyDown: ({ event, view, range }) => {
              if (event.key === 'Escape') {
                view.dom.classList.remove('has-slash-menu');
                component?.$destroy();
                dom?.remove();

                return true;
              }

              if (event.key === 'Enter' && selectedItem) {
                selectedItem.command({ editor: this.editor, range });
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
