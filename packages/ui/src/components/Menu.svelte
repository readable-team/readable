<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { setContext } from 'svelte';
  import { afterNavigate } from '$app/navigation';
  import { createFloatingActions, portal } from '../actions/index';
  import type { Placement } from '@floating-ui/dom';

  export let open = false;
  export let placement: Placement = 'bottom';
  export let offset = 4;

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
  <slot name="button" />
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
    class={flex({
      direction: 'column',
      borderRadius: '10px',
      padding: '6px',
      backgroundColor: 'surface.primary',
      minWidth: '140px',
      boxShadow: 'emphasize',
    })}
    use:floating
  >
    <slot />
  </div>
{/if}
