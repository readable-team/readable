<script lang="ts">
  import { flex } from '@readable/styled-system/patterns';
  import Item from './Item.svelte';
  import { store } from './store';
</script>

<div
  class={flex({
    direction: 'column',
    gap: '8px',
    position: 'fixed',
    zIndex: '100',
    bottom: '20px',
    paddingLeft: '20px',
    width: 'screen',
    pointerEvents: 'none',
  })}
>
  {#each $store as toast (toast.id)}
    <Item {toast} />
  {/each}
</div>
