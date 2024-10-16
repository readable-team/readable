import { Extension } from '@tiptap/core';
import { Plugin } from '@tiptap/pm/state';
import { nanoid } from 'nanoid';
import type { Extensions } from '@tiptap/core';

const createId = () => nanoid();

export const withNodeId = (extensions: Extensions) => {
  const types = extensions
    .filter((extension) => extension.type === 'node' && !['doc', 'text'].includes(extension.name))
    .map((extension) => extension.name);
  types.push('image', 'inlineImage', 'file', 'embed');

  const nodeId = Extension.create({
    name: 'nodeId',
    priority: 10_000,

    addGlobalAttributes() {
      return [
        {
          types,
          attributes: {
            nodeId: {
              default: null,
              rendered: false,
            },
          },
        },
      ];
    },

    addProseMirrorPlugins() {
      return [
        new Plugin({
          appendTransaction: (transactions, oldState, newState) => {
            const docChanged =
              transactions.some((transaction) => transaction.docChanged) && !oldState.doc.eq(newState.doc);
            if (!docChanged) {
              return;
            }

            const ids = new Set<string>();
            const { tr, doc } = newState;

            doc.descendants((node, pos) => {
              if (node.isText) {
                return;
              }

              if (node.attrs.nodeId === null || ids.has(node.attrs.nodeId)) {
                tr.setNodeAttribute(pos, 'nodeId', createId());
              } else {
                ids.add(node.attrs.nodeId);
              }
            });

            if (tr.steps.length > 0) {
              return tr;
            }
          },
        }),
      ];
    },
  });

  return [...extensions, nodeId];
};
