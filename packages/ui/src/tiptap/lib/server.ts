import { Node } from '@tiptap/core';
import type { NodeConfig } from '@tiptap/core';

type CreateNodeViewOptions = NodeConfig;

export const createServerNodeView = (options: CreateNodeViewOptions) => {
  return Node.create({
    ...options,

    parseHTML() {
      return [{ tag: `node-view[data-node-view-type=${options.name}]` }];
    },
  });
};
