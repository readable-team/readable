<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { center } from '@readable/styled-system/patterns';
  import { mergeAttributes } from '@tiptap/core';
  import { createColGroup } from '@tiptap/extension-table';
  import { DomOutputSpecRenderer, NodeView, NodeViewContentEditable } from '../../lib';
  import type { NodeViewProps } from '../../lib';

  type $$Props = NodeViewProps;
  $$restProps;

  export let node: NodeViewProps['node'];
  export let HTMLAttributes: NodeViewProps['HTMLAttributes'];
  export let extension: NodeViewProps['extension'];
  export let editor: NodeViewProps['editor'] | undefined;
  // export let selected: NodeViewProps['selected'];
  // export let deleteNode: NodeViewProps['deleteNode'];
  // export let getPos: NodeViewProps['getPos'];
  // export let updateAttributes: NodeViewProps['updateAttributes'];

  $: ({ colgroup, tableWidth, tableMinWidth } = createColGroup(node, extension.options.cellMinWidth));
</script>

<NodeView>
  <table
    {...mergeAttributes(extension.options.HTMLAttributes, HTMLAttributes, {
      class: css({ position: 'relative', border: '1px solid', borderColor: 'neutral.30', borderBottom: 'none' }),
      style: tableWidth ? `width: ${tableWidth}` : `min-width: ${tableMinWidth}`,
    })}
  >
    <DomOutputSpecRenderer contenteditable={false} domOutputSpec={colgroup} />
    <NodeViewContentEditable as="tbody" />
    {#if editor?.isEditable}
      <div
        class={center({
          position: 'absolute',
          zIndex: '10',
          left: '1/2',
          bottom: '0',
          translate: 'auto',
          translateX: '-1/2',
          translateY: '1/2',
        })}
        contenteditable={false}
      >
        <button
          class={css({
            borderWidth: '1px',
            borderRadius: '4px',
            textStyle: '14m',
            paddingX: '4px',
            paddingY: '2px',
            backgroundColor: 'surface.primary',
            _hover: {
              backgroundColor: 'surface.secondary',
            },
          })}
          type="button"
          on:click={() => editor?.chain().addRowAfter().run()}
        >
          추가
        </button>
      </div>

      <div
        class={center({
          position: 'absolute',
          zIndex: '10',
          top: '1/2',
          right: '0',
          translate: 'auto',
          translateX: '1/2',
          translateY: '-1/2',
        })}
        contenteditable={false}
      >
        <button
          class={css({
            borderWidth: '1px',
            borderRadius: '4px',
            textStyle: '14m',
            paddingX: '4px',
            paddingY: '2px',
            backgroundColor: 'surface.primary',
            _hover: {
              backgroundColor: 'surface.secondary',
            },
          })}
          type="button"
          on:click={() => editor?.commands.addColumnAfter()}
        >
          추가
        </button>
      </div>
    {/if}
  </table>
</NodeView>
