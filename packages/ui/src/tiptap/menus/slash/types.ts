import type { Editor, Range } from '@tiptap/core';
import type { ComponentType } from 'svelte';

type CommandParams = {
  editor: Editor;
  range: Range;
};

export type MenuItem = {
  id: string;
  type: string;
  name: string;
  group: MenuItemGroup;
  keywords: string[];
  icon: ComponentType;
  visible?: boolean;
  command: (params: CommandParams) => void;
};

export type MenuItemGroup = 'heading' | 'block' | 'media';
