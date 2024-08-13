<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Icon } from '@readable/ui/components';
  import BoldIcon from '~icons/lucide/bold';
  import ChevronDownIcon from '~icons/lucide/chevron-down';
  import CodeXmlIcon from '~icons/lucide/code-xml';
  import ItalicIcon from '~icons/lucide/italic';
  // import LinkIcon from '~icons/lucide/link';
  import StrikethroughIcon from '~icons/lucide/strikethrough';
  import UnderlineIcon from '~icons/lucide/underline';
  import { createFloatingActions } from '../../../actions';
  import type { Editor } from '@tiptap/core';
  import type { Node } from '@tiptap/pm/model';

  export let editor: Editor;
  export let from: number | null = null;
  export let to: number | null = null;

  let topLevelNodeTypePickerOpened = false;

  const { anchor, floating } = createFloatingActions({
    placement: 'bottom-start',
    offset: 12,
    onClickOutside: () => {
      topLevelNodeTypePickerOpened = false;
    },
  });

  const topLevelNodeTypes = [
    { id: 'heading-1', label: '제목1' },
    { id: 'heading-2', label: '제목2' },
    { id: 'heading-3', label: '제목3' },
    { id: 'paragraph', label: '텍스트' },
  ];

  const marks = [
    { name: 'bold', icon: BoldIcon },
    { name: 'italic', icon: ItalicIcon },
    { name: 'underline', icon: UnderlineIcon },
    { name: 'strike', icon: StrikethroughIcon },
    { name: 'code', icon: CodeXmlIcon },
  ];

  let selectedBlocks: Node[] = [];
  let activeNode: Node | null = null;
  let activeNodeTypeId: string | null | undefined = null;
  let activeMarks: string[] = [];

  const updateSelectedNodeAnMarks = () => {
    activeMarks = marks.map(({ name }) => name).filter((name) => editor.isActive(name));
    activeNode = editor.state.selection.$head.parent;

    selectedBlocks = [];
    if (from !== null && to !== null) {
      editor.state.doc.nodesBetween(from, to, (node) => {
        if (node.isBlock) {
          selectedBlocks.push(node);
        }
      });
    }
    selectedBlocks = selectedBlocks;
  };

  $: editor.on('update', () => {
    updateSelectedNodeAnMarks();
  });

  $: editor.on('selectionUpdate', () => {
    updateSelectedNodeAnMarks();
  });

  $: activeNodeTypeId =
    activeNode?.type.name === 'heading'
      ? `${activeNode?.type.name}-${activeNode?.attrs?.level}`
      : activeNode?.type.name;
</script>

<div
  class={flex({
    height: '40px',
    alignItems: 'center',
    paddingX: '8px',
    gap: '2px',
    backgroundColor: 'surface.tertiary',
    boxShadow: 'heavy',
    borderRadius: '6px',
  })}
>
  {#if selectedBlocks.length === 1}
    <button
      class={flex({
        paddingLeft: '6px',
        paddingRight: '5px',
        height: '30px',
        alignItems: 'center',
        gap: '14px',
        borderRadius: '4px',
        _hover: {
          backgroundColor: 'neutral.10',
        },
        _pressed: {
          // theme=selected
          backgroundColor: 'neutral.20',
        },
        _active: {
          // theme=pressed
          backgroundColor: 'neutral.30',
        },
      })}
      aria-pressed={topLevelNodeTypePickerOpened}
      type="button"
      on:click={() => {
        topLevelNodeTypePickerOpened = true;
      }}
      use:anchor
    >
      <div
        class={css({
          textStyle: '14sb',
        })}
      >
        {topLevelNodeTypes.find((nodeType) => nodeType.id === activeNodeTypeId)?.label}
      </div>
      <Icon icon={ChevronDownIcon} size={12} />
    </button>
    {#if topLevelNodeTypePickerOpened}
      <div
        class={flex({
          width: '163px',
          flexDirection: 'column',
          backgroundColor: 'surface.tertiary',
          borderRadius: '6px',
          boxShadow: 'heavy',
          gap: '4px',
          padding: '5px',
        })}
        use:floating
      >
        {#each topLevelNodeTypes as nodeType (nodeType.id)}
          <button
            class={flex({
              paddingX: '10px',
              paddingY: '8px',
              borderRadius: '6px',
              textStyle: '14sb',
              _hover: {
                backgroundColor: 'neutral.10',
              },
              _pressed: {
                backgroundColor: 'neutral.20',
              },
            })}
            aria-pressed={activeNodeTypeId === nodeType.id}
            type="button"
            on:click={() => {
              if (nodeType.id.includes('heading')) {
                const level = Number(nodeType.id.split('-')[1]);
                editor.chain().focus().setNode('heading', { level }).run();
              } else {
                editor.chain().focus().setNode(nodeType.id).run();
              }

              topLevelNodeTypePickerOpened = false;
            }}
          >
            {nodeType.label}
          </button>
        {/each}
      </div>
    {/if}
  {/if}
  {#each marks as { name, icon } (name)}
    <button
      class={flex({
        width: '30px',
        height: '30px',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '4px',
        _hover: {
          backgroundColor: 'neutral.10',
        },
        _pressed: {
          // theme=selected
          backgroundColor: 'neutral.20',
        },
        _active: {
          // theme=pressed
          backgroundColor: 'neutral.30',
        },
      })}
      aria-pressed={activeMarks.includes(name)}
      type="button"
      on:click={() => {
        editor.chain().focus().toggleMark(name).run();
      }}
    >
      <Icon {icon} size={16} />
    </button>
  {/each}
</div>
