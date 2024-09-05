import type { Editor, Range } from '@tiptap/core';
import type { ComponentType } from 'svelte';

type CommandParams = {
  editor: Editor;
  range: Range;
};

export type MenuItem = {
  id: string;
  name: string;
  group: MenuItemGroup;
  keywords: string[];
  icon: ComponentType;
  command: (params: CommandParams) => void;
};

export type MenuItemGroup = 'heading' | 'block' | 'media';
