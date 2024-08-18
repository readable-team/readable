import { autoUpdate, computePosition, flip, hide } from '@floating-ui/dom';
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
          const { $anchor, empty } = state.selection;
          const block = $anchor.node(1);
          return empty && block.type.name === 'paragraph';
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
          let cleanup: (() => void) | null = null;

          let initialRange: { from: number; to: number } | null = null;

          const exitSlashMenu = () => {
            this.editor.view.dom.classList.remove('has-slash-menu');
            cleanup?.();
            component?.$destroy();
            dom?.remove();
          };

          const updateSlashMenuPosition = async (domRectGetter: () => DOMRect | null) => {
            if (!dom) {
              return;
            }

            const virtualEl: VirtualElement = {
              getBoundingClientRect: () => domRectGetter() ?? new DOMRect(),
              contextElement: this.editor.view.dom,
            };

            cleanup?.();
            cleanup = autoUpdate(virtualEl, dom, async () => {
              if (!dom) {
                return;
              }

              const { x, y, middlewareData } = await computePosition(virtualEl, dom, {
                placement: 'bottom-start',
                middleware: [flip({ padding: 16 }), hide({ padding: 16 })],
              });

              dom.style.left = `${x}px`;
              dom.style.top = `${y}px`;
              dom.style.visibility = middlewareData.hide?.referenceHidden ? 'hidden' : 'visible';
            });
          };

          return {
            onStart: async ({ clientRect, editor, range, items }) => {
              initialRange = range;
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

              if (!clientRect) {
                return;
              }

              document.body.append(dom);

              dom.style.position = 'absolute';
              dom.style.visibility = 'visible';

              await updateSlashMenuPosition(clientRect);

              editor.view.dom.classList.add('has-slash-menu');
            },

            onUpdate: async ({ clientRect, editor, range, items }) => {
              selectedItem = items[0];
              component?.$set({ editor, range, items, selectedIdx: 0 });

              if (initialRange?.from !== range.from) {
                exitSlashMenu();
              }

              if (clientRect) {
                await updateSlashMenuPosition(clientRect);
              }
            },

            onKeyDown: ({ event, range }) => {
              if (event.key === 'Escape') {
                exitSlashMenu();
                return true;
              }

              if (event.key === 'Enter' && selectedItem) {
                selectedItem.command({ editor: this.editor, range });
                return true;
              }

              return component?.handleKeyDown?.(event) ?? false;
            },

            onExit: () => {
              exitSlashMenu();
            },
          };
        },
      }),
    ];
  },
});
