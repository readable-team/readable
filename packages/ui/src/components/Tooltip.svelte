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
      boxShadow: 'emphasize',
      borderRadius: '8px',
      maxWidth: '220px',
    })}
    role="tooltip"
    use:floating
    transition:scale={{ start: 0.9, duration: 200 }}
  >
    <div
      class={css({
        paddingX: '12px',
        paddingY: '9px',
        textStyle: '12m',
        borderRadius: '6px',
        position: 'relative',
        zIndex: 'tooltip.content',
        backgroundColor: 'white',
        color: 'gray.800',
        _dark: {
          backgroundColor: 'darkgray.800',
          color: 'gray.100',
        },
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
        width: '16px',
        height: '16px',
        borderRadius: '2px',
        boxShadow: 'emphasize',
        backgroundColor: 'white',
        _dark: {
          backgroundColor: 'darkgray.800',
        },
      })}
      use:arrow
    />
  </div>
{/if}
