<script lang="ts">
  import { flex } from '@readable/styled-system/patterns';
  import { portal } from '../../actions';
  import { dialogStore } from '../../components';
  import Item from './Item.svelte';
  import { store } from './store';

  let toastProviderEl: HTMLElement;

  $: if (toastProviderEl) {
    if ($store.length > 0) {
      toastProviderEl.showPopover();
    } else {
      // 마지막 토스트 out transition 모두 끝나면 hidePopover
      const lastToast = toastProviderEl.querySelector('.toast-item');
      lastToast?.addEventListener('outroend', () => toastProviderEl.hidePopover(), { once: true });
    }
  }
</script>

<div
  bind:this={toastProviderEl}
  class={flex({
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    direction: 'column',
    gap: '8px',
    width: 'screen',
    height: 'screen',
    paddingLeft: '20px',
    paddingBottom: '20px',
    pointerEvents: 'none',
  })}
  popover="manual"
  use:portal={$dialogStore.at(-1)}
>
  {#each $store as toast (toast.id)}
    <Item {toast} />
  {/each}
</div>
