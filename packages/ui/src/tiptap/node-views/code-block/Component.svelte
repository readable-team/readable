<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { NodeView, NodeViewContentEditable } from '../../lib';
  import Menu from './Menu.svelte';
  import type { NodeViewProps } from '../../lib';

  type $$Props = NodeViewProps;
  $$restProps;

  export let node: NodeViewProps['node'];
  // export let editor: NodeViewProps['editor'] | undefined;
  // export let selected: NodeViewProps['selected'];
  export let updateAttributes: NodeViewProps['updateAttributes'];
</script>

<NodeView style={css.raw({ position: 'relative' })}>
  <div class={css({ position: 'absolute', top: '0', left: '0', translate: 'auto' })}>
    <Menu {node} {updateAttributes} />
  </div>

  <NodeViewContentEditable
    style={css.raw({
      paddingY: '8px',
      paddingX: '12px',
      fontSize: '13px',
      fontFamily: 'mono',
      backgroundColor: 'gray.100',
      overflowX: 'auto',
    })}
    as="pre"
  />
</NodeView>
