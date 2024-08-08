<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import GripVerticalIcon from '~icons/lucide/grip-vertical';
  import Icon from '../../../components/Icon.svelte';
  import type { Editor } from '@tiptap/core';
  import type { Node } from '@tiptap/pm/model';

  export let editor: Editor;
  export let pos: number | null = null;
  export let node: Node | null = null;

  const handleGripClick = () => {
    if (!pos || !node) {
      return;
    }

    editor.commands.setBlockSelection({
      from: pos,
      to: pos + node.nodeSize - 1,
    });
  };
</script>

<button type="button" on:click={handleGripClick}>
  <Icon style={css.raw({ color: 'gray.500' })} icon={GripVerticalIcon} />
</button>
