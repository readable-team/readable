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

  const handlePlusClick = () => {
    if (pos === null || node === null) {
      return;
    }

    const { state } = editor;

    const block = state.doc.nodeAt(pos);
    if (!block) {
      return;
    }

    if (block.type.name === 'paragraph' && block.childCount === 0) {
      editor.chain().deleteCurrentNode().insertContentAt(pos, '/').focus().run();
    } else {
      editor
        .chain()
        .insertContentAt(pos + node.nodeSize, {
          type: 'paragraph',
          content: [{ type: 'text', text: '/' }],
        })
        .focus()
        .run();
    }
  };

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

<div class={flex({ align: 'center', gap: '4px' })}>
  <button
    class={css({ borderRadius: '4px', padding: '2px', color: 'neutral.60', _hover: { backgroundColor: 'neutral.20' } })}
    type="button"
    on:click={handlePlusClick}
  >
    <Icon icon={PlusIcon} />
  </button>

  <button
    class={css({ borderRadius: '4px', padding: '2px', color: 'neutral.60', _hover: { backgroundColor: 'neutral.20' } })}
    draggable="true"
    type="button"
    on:click={handleGripClick}
    on:dragstart={handleDragStart}
  >
    <Icon icon={GripVerticalIcon} />
  </button>
</div>
