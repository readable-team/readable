<script lang="ts">
  import { css, cx } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import GripVerticalIcon from '~icons/lucide/grip-vertical';
  import PlusIcon from '~icons/lucide/plus';
  import { Icon } from '../../../components';
  import { pluginKey as slashPluginKey } from '../slash/extension';
  import { menuItems } from '../slash/items';
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
      editor
        .chain()
        .setMeta(slashPluginKey, {
          active: true,
          range: {
            from: pos,
            to: pos + 1,
          },
          items: menuItems,
        })
        .focus(pos + 1)
        .run();
    } else {
      editor
        .chain()
        .insertContentAt(pos + node.nodeSize, {
          type: 'paragraph',
        })
        .setMeta(slashPluginKey, {
          active: true,
          range: {
            from: pos + node.nodeSize + 1,
            to: pos + node.nodeSize + 1,
          },
          items: menuItems,
        })
        .focus(pos + node.nodeSize + 1)
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

    const target = document.createElement('div');
    target.className = cx(
      'ProseMirror',
      css({
        width: '720px',
        position: 'fixed',
        backgroundColor: 'white',
        overflow: 'hidden',

        '& > *': {
          width: 'full!',
          margin: '0!',
          padding: '0!',
        },
      }),
    );

    const cloned = child.cloneNode(true) as HTMLElement;

    target.append(cloned);
    document.body.append(target);

    event.dataTransfer.setDragImage(target, 0, 0);
    event.dataTransfer.clearData();
    event.dataTransfer.effectAllowed = 'move';

    setTimeout(() => {
      target.remove();
    }, 0);

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

<div class={flex({ align: 'center' })}>
  <button
    class={css({ borderRadius: '6px', padding: '2px', color: 'neutral.50', _hover: { backgroundColor: 'neutral.20' } })}
    type="button"
    on:click={handlePlusClick}
  >
    <Icon icon={PlusIcon} size={18} />
  </button>

  <button
    class={css({ borderRadius: '6px', padding: '2px', color: 'neutral.50', _hover: { backgroundColor: 'neutral.20' } })}
    draggable="true"
    type="button"
    on:click={handleGripClick}
    on:dragstart={handleDragStart}
  >
    <Icon icon={GripVerticalIcon} size={18} />
  </button>
</div>
