<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { createEventDispatcher } from 'svelte';
  import { portal } from '../../actions';
  import { dialogStore } from './store';

  export let open = false;

  const dispatch = createEventDispatcher();

  let dialogElement: HTMLDialogElement;
  $: if (dialogElement) {
    if (open) {
      dialogElement.showModal();
      dialogStore.update((prev) => [...prev, dialogElement]);
    } else {
      dialogElement.close();
      dialogStore.update((prev) => prev.filter((el) => el !== dialogElement));
    }
  }

  function handleClose() {
    dispatch('close');
  }
</script>

<dialog
  bind:this={dialogElement}
  class={css({
    width: 'full',
    height: 'full',
    maxWidth: '[unset]',
    maxHeight: '[unset]',
    '& ::backdrop': {
      display: 'none',
    },
  })}
  on:close={handleClose}
  use:portal
>
  <!-- NOTE: dialog 닫혀있을 때는 scrollLock 등 사이드 이펙트 안 일어나게 아예 렌더링 안 함 -->
  {#if open}
    <slot />
  {/if}
</dialog>
