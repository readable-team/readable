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
  <ul
    style:width={setFullWidth ? `${buttonEl?.getBoundingClientRect().width}px` : 'auto'}
    class={css(
      {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        borderRadius: '6px',
        padding: '4px',
        backgroundColor: 'surface.primary',
        minWidth: '140px',
        boxShadow: 'heavy',
        overflowY: 'auto',
      },
      $$slots.action && { paddingBottom: '0' },
      listStyle,
    )}
    use:floating
  >
    {#if $$slots.action}
      <li>
        <ul class={css({ display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' })}>
          <slot />
        </ul>
      </li>
    {:else}
      <slot />
    {/if}

    {#if $$slots.action}
      <li class={css({ position: 'sticky', bottom: '0', paddingBottom: '12px', backgroundColor: 'surface.primary' })}>
        <slot name="action" />
      </li>
    {/if}
  </ul>
{/if}
