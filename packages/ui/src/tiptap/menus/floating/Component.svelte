<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import GripVerticalIcon from '~icons/lucide/grip-vertical';
  import PlusIcon from '~icons/lucide/plus';
  import Icon from '../../../components/Icon.svelte';
  import type { Editor } from '@tiptap/core';
  import type { Node } from '@tiptap/pm/model';

  export let editor: Editor;
  export let pos: number | null = null;
  export let node: Node | null = null;

  const handleGripClick = () => {
    if (pos === null || node === null) {
      return;
    }

    editor
      .chain()
      .setBlockSelection({
        from: pos,
        to: pos + node.nodeSize,
      })
      .focus()
      .run();
  };

  const handleDragStart = (event: DragEvent) => {
    if (pos === null || node === null || !event.dataTransfer) {
      return;
    }

    const dom = editor.view.domAtPos(pos);
    if (!(dom.node instanceof Element)) {
      return;
    }

    editor.commands.setTextSelection(pos);
    const child = dom.node.children[dom.offset];

    event.dataTransfer.setDragImage(child, 0, 0);
    event.dataTransfer.clearData();
    event.dataTransfer.effectAllowed = 'move';

    editor
      .chain()
      .setBlockSelection(
        {
          from: pos,
          to: pos + node.nodeSize,
        },
        true,
      )
      .focus()
      .run();

    editor.view.dragging = {
      slice: editor.state.selection.content(),
      move: true,
    };
  };
</script>

<div class={flex({ align: 'center', gap: '2px' })}>
  <button type="button">
    <Icon style={css.raw({ color: 'gray.500' })} icon={PlusIcon} />
  </button>

  <button draggable="true" type="button" on:click={handleGripClick} on:dragstart={handleDragStart}>
    <Icon style={css.raw({ color: 'gray.500' })} icon={GripVerticalIcon} />
  </button>
</div>
