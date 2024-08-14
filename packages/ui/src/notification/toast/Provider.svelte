<script lang="ts">
  import { flex } from '@readable/styled-system/patterns';
  import Item from './Item.svelte';
  import { store } from './store';
</script>

<div
  class={flex({
    direction: 'column',
    gap: '8px',
    align: 'center',
    position: 'fixed',
    zIndex: '100',
    bottom: '60px',
    left: '1/2',
    translate: 'auto',
    translateX: '-1/2',
    paddingLeft: '[300px]',
    width: 'screen',
    pointerEvents: 'none',
  })}
>
  {#each $store as toast (toast.id)}
    <Item {toast} />
  {/each}
</div>
