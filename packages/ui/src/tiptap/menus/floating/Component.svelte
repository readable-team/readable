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
    if (!pos || !node) {
      return;
    }

    const pos$ = editor.state.doc.resolve(pos);

    editor.commands.setBlockSelection({
      from: pos$.before(),
      to: pos$.after(),
    });
  };

  const handleDragStart = (event: DragEvent) => {
    if (!pos || !node || !event.dataTransfer) {
      return;
    }

    const dom = editor.view.domAtPos(pos);
    if (!(dom.node instanceof Element)) {
      return;
    }

    event.dataTransfer.clearData();
    event.dataTransfer.setDragImage(dom.node, 0, 0);
    event.dataTransfer.effectAllowed = 'move';

    const pos$ = editor.state.doc.resolve(pos);

    editor.commands.setBlockSelection({ from: pos$.before(), to: pos$.after() }, true);

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
