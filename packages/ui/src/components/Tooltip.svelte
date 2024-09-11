<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { writable } from 'svelte/store';
  import { scale } from 'svelte/transition';
  import { createFloatingActions, hover } from '../actions';
  import type { Placement } from '@floating-ui/dom';
  import type { SystemStyleObject } from '@readable/styled-system/types';

  export let style: SystemStyleObject | undefined = undefined;
  export let tooltipStyle: SystemStyleObject | undefined = undefined;
  export let offset: number | undefined = undefined;

  export let enabled = true;
  export let message: string | undefined = undefined;
  export let placement: Placement = 'bottom';
  export let keepShowing = false;

  const hovered = writable(false);

  const { anchor, floating, arrow } = createFloatingActions({
    placement,
    offset: offset ?? 6,
    arrow: true,
  });
</script>

<div class={css(style)} use:anchor use:hover={hovered}>
  <slot />
</div>

{#if enabled && ($hovered || keepShowing)}
  <div
    class={css(
      {
        borderRadius: '6px',
        paddingX: '12px',
        paddingY: '8px',
        textStyle: '12m',
        backgroundColor: { base: 'gray.800', _dark: 'darkgray.500' },
        color: 'white',
        zIndex: '100',
        maxWidth: '220px',
        whiteSpace: 'pre-wrap',
        wordBreak: 'keep-all',
      },
      tooltipStyle,
    )}
    role="tooltip"
    use:floating
    transition:scale={{ start: 0.9, duration: 200 }}
  >
    <slot name="message">
      {message}
    </slot>
    <div
      class={css({
        borderTopLeftRadius: '2px',
        size: '8px',
        backgroundColor: { base: 'gray.800', _dark: 'darkgray.500' },
      })}
      use:arrow
    />
  </div>
{/if}
