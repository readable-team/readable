<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { setContext } from 'svelte';
  import { afterNavigate } from '$app/navigation';
  import { createFloatingActions, portal } from '../actions/index';
  import type { Placement } from '@floating-ui/dom';
  import type { SystemStyleObject } from '@readable/styled-system/types';

  export let open = false;
  export let placement: Placement = 'bottom';
  export let offset = 4;
  export let listStyle: SystemStyleObject | undefined = undefined;

  const { anchor, floating } = createFloatingActions({
    placement,
    offset,
  });

  setContext('close', () => (open = false));

  afterNavigate(() => {
    open = false;
  });
</script>

<button type="button" on:click={() => (open = !open)} use:anchor>
  <slot name="button" {open} />
</button>

{#if open}
  <div
    class={css({ position: 'fixed', inset: '0' })}
    role="button"
    tabindex="-1"
    on:click={() => (open = false)}
    on:keypress={null}
    use:portal
  />

  <div
    class={css(
      {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        borderRadius: '10px',
        padding: '6px',
        backgroundColor: 'surface.tertiary',
        minWidth: '140px',
        boxShadow: 'emphasize',
      },
      listStyle,
    )}
    use:floating
  >
    <slot />
  </div>
{/if}
