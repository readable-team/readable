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
const menuItemTypeSet = new Set(menuItems.map((item) => item.type));

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
          if (!empty) {
            return false;
          }

          const block = $anchor.node($anchor.depth - 1);

          for (let i = 0; i < block.type.contentMatch.edgeCount; i++) {
            const edge = block.type.contentMatch.edge(i);
            if (menuItemTypeSet.has(edge.type.name)) {
              return true;
            }
          }

          return false;
        },

        items: ({ editor, query }) => {
          const { $anchor } = editor.state.selection;
          const block = $anchor.node($anchor.depth - 1);
          const typeSet = new Set<string>();

          for (let i = 0; i < block.type.contentMatch.edgeCount; i++) {
            const edge = block.type.contentMatch.edge(i);
            if (menuItemTypeSet.has(edge.type.name)) {
              typeSet.add(edge.type.name);
            }
          }

          const items = menuItems.filter((item) => typeSet.has(item.type));

          return matchSorter(items, disassemble(query), {
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

            cleanup = null;
            component = null;
            dom = null;
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
              dom.style.zIndex = '1';
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

              component.$on('close', () => {
                exitSlashMenu();
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

              if (event.key === 'Enter' && selectedItem && dom && component) {
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
