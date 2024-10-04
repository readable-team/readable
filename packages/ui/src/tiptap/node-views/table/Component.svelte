<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { center } from '@readable/styled-system/patterns';
  import { mergeAttributes } from '@tiptap/core';
  import { createColGroup } from '@tiptap/extension-table';
  import { NodeView, NodeViewContentEditable } from '../../lib';
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

  $: props = createColGroup(node, extension.options.cellMinWidth);
</script>

<NodeView style={css.raw({ position: 'relative' })}>
  <table
    {...mergeAttributes(extension.options.HTMLAttributes, HTMLAttributes, {
      class: css({ width: 'full' }),
      style: props.tableWidth ? `width: ${props.tableWidth}` : `min-width: ${props.tableMinWidth}`,
    })}
  >
    <NodeViewContentEditable as="tbody" />
  </table>

  <div
    class={center({ position: 'absolute', left: '0', right: '0', bottom: '0', translate: 'auto', translateY: '1/2' })}
    contenteditable={false}
  >
    <button
      class={css({ borderWidth: '1px', borderRadius: '4px', textStyle: '14m' })}
      type="button"
      on:click={() => editor?.chain().addRowAfter().run()}
    >
      추가
    </button>
  </div>

  <div
    class={center({ position: 'absolute', top: '0', bottom: '0', right: '0', translate: 'auto', translateX: '1/2' })}
    contenteditable={false}
  >
    <button
      class={css({ borderWidth: '1px', borderRadius: '4px', textStyle: '14m' })}
      type="button"
      on:click={() => editor?.commands.addColumnAfter()}
    >
      추가
    </button>
  </div>
</NodeView>
