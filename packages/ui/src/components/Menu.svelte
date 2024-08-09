<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { setContext } from 'svelte';
  import { afterNavigate } from '$app/navigation';
  import { createFloatingActions } from '../actions/index';
  import type { Placement } from '@floating-ui/dom';
  import type { SystemStyleObject } from '@readable/styled-system/types';

  export let open = false;
  export let placement: Placement = 'bottom';
  export let offset = 6;
  export let listStyle: SystemStyleObject | undefined = undefined;
  export let setFullWidth = false;

  let buttonEl: HTMLButtonElement | undefined;

  const { anchor, floating } = createFloatingActions({
    placement,
    offset,
    onClickOutside: () => {
      open = false;
    },
  });

  setContext('close', () => (open = false));

  afterNavigate(() => {
    open = false;
  });
</script>

<button bind:this={buttonEl} type="button" on:click={() => (open = !open)} use:anchor>
  <slot name="button" {open} />
</button>

{#if open}
  <div
    style:width={setFullWidth ? `${buttonEl?.getBoundingClientRect().width}px` : 'auto'}
    class={css(
      {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        borderRadius: '10px',
        padding: '12px',
        backgroundColor: 'surface.primary',
        minWidth: '140px',
        boxShadow: 'heavy',
        overflowY: 'auto',
      },
      listStyle,
    )}
    use:floating
  >
    <slot />
  </div>
{/if}
