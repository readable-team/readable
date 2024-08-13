<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { writable } from 'svelte/store';
  import { scale } from 'svelte/transition';
  import { createFloatingActions, hover } from '../actions';
  import type { Placement } from '@floating-ui/dom';
  import type { SystemStyleObject } from '@readable/styled-system/types';

  export let style: SystemStyleObject | undefined = undefined;
  export let offset: number | undefined = undefined;

  export let enabled = true;
  export let message: string | undefined = undefined;
  export let placement: Placement = 'bottom';
  export let keepShowing = false;

  const hovered = writable(false);

  const { anchor, floating, arrow } = createFloatingActions({
    placement,
    offset: offset ?? 0,
    arrow: true,
  });
</script>

<span class={css(style)} use:anchor use:hover={hovered}>
  <slot />
</span>

{#if enabled && ($hovered || keepShowing)}
  <div
    class={css({
      zIndex: 'tooltip.body',
      borderRadius: '8px',
      maxWidth: '224px',
    })}
    role="tooltip"
    use:floating
    transition:scale={{ start: 0.9, duration: 200 }}
  >
    <div
      class={css({
        position: 'relative',
        zIndex: 'tooltip.content',
        borderRadius: '6px',
        paddingX: '14px',
        paddingY: '10px',
        textStyle: '14sb',
        color: 'white',
        backgroundColor: 'neutral.100',
      })}
    >
      <slot name="message">
        {message}
      </slot>
    </div>
    <div
      class={css({
        position: 'relative',
        zIndex: 'tooltip.arrow',
        borderRadius: '2px',
        size: '16px',
        backgroundColor: 'neutral.100',
      })}
      use:arrow
    />
  </div>
{/if}
