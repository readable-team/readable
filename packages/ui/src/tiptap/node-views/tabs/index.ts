import { css } from '@readable/styled-system/css';
import { findParentNode, mergeAttributes, Node } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { createNodeView } from '../../lib';
import Component from './Component.svelte';

declare module '@tiptap/core' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Commands<ReturnType> {
    tabs: {
      setTabs: () => ReturnType;
      addTab: () => ReturnType;
      selectTab: (idx: number) => ReturnType;
    };
  }
}

const key = new PluginKey();

export const Tabs = createNodeView(Component, {
  name: 'tabs',
  group: 'block',
  content: 'tab+',

  addCommands() {
    return {
      setTabs:
        () =>
        ({ tr, dispatch }) => {
          const node = this.type.createAndFill();
          if (!node) {
            return false;
          }

          if (dispatch) {
            tr.replaceSelectionWith(node);
          }

          return true;
        },
      addTab:
        () =>
        ({ state, tr, dispatch }) => {
          const tab = findParentNode((node) => node.type === this.type)(state.selection);
          if (!tab) {
            return false;
          }

          const pos = tab.pos + tab.node.nodeSize - 1;
          const tabNode = state.schema.nodes.tab.createChecked(null, state.schema.nodes.paragraph.createAndFill());

          if (dispatch) {
            tr.insert(pos, tabNode);
          }

          return true;
        },
      selectTab:
        (idx) =>
        ({ state, tr, dispatch }) => {
          const tab = findParentNode((node) => node.type === this.type)(state.selection);
          if (!tab) {
            return false;
          }

          if (dispatch) {
            tr.setMeta(key, { tabPos: tab.pos, selectedTabIdx: idx });
          }

          return true;
        },
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key,
        state: {
          init: (_, state) => {
            const { doc } = state;
            const decorations: Decoration[] = [];

            doc.descendants((node, pos, parent, index) => {
              if (parent?.type !== this.type) {
                return;
              }

              if (index === 0) {
                const decoration = Decoration.node(pos, pos + node.nodeSize, {
                  'data-tab-selected': '',
                });

                decorations.push(decoration);
              }
            });

            return DecorationSet.create(doc, decorations);
          },
          apply: (tr, decorations, _, state) => {
            const noop = () => {
              if (tr.docChanged) {
                // eslint-disable-next-line unicorn/no-array-callback-reference, unicorn/no-array-method-this-argument
                return decorations.map(tr.mapping, state.doc);
              }

              return decorations;
            };

            const meta = tr.getMeta(key);
            if (!meta) {
              return noop();
            }

            const { tabPos, selectedTabIdx } = meta as { tabPos: number; selectedTabIdx: number };
            const { doc } = state;

            const tab = doc.nodeAt(tabPos);
            if (tab?.type !== this.type) {
              return noop();
            }

            // eslint-disable-next-line unicorn/no-array-callback-reference, unicorn/no-array-method-this-argument
            decorations = decorations.remove(decorations.find(tabPos, tabPos + tab.nodeSize));

            // eslint-disable-next-line unicorn/no-array-for-each
            tab.forEach((node, offset, index) => {
              const pos = tabPos + offset + 1;

              if (index === selectedTabIdx) {
                const decoration = Decoration.node(pos, pos + node.nodeSize, {
                  'data-tab-selected': '',
                });

                decorations = decorations.add(doc, [decoration]);
              }
            });

            return decorations;
          },
        },
        props: {
          decorations: (state) => key.getState(state),
        },
      }),
    ];
  },
});

export const Tab = Node.create({
  name: 'tab',
  content: '(paragraph|orderedList|bulletList|image|file|embed)+',
  isolating: true,

  addAttributes() {
    return {
      title: {
        default: '새 탭',
        rendered: false,
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        role: 'tabpanel',
        class: css({ display: 'none', marginTop: '0', borderWidth: '1px', borderColor: 'red.500' }),
      }),
      0,
    ];
  },
});
