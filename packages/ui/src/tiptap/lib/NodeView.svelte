<script lang="ts">
  import { css, cx } from '@readable/styled-system/css';
  import { getContext } from 'svelte';
  import type { SystemStyleObject } from '@readable/styled-system/types';
  import type { DragEventHandler } from 'svelte/elements';

  export let as: keyof HTMLElementTagNameMap = 'div';
  export let style: SystemStyleObject | undefined = undefined;

  const onDragStart = getContext<DragEventHandler<HTMLDivElement>>('onDragStart');
</script>

<svelte:element
  this={as}
  class={cx(css({ whiteSpace: 'normal' }, style))}
  data-node-view
  role="presentation"
  on:dragstart={onDragStart}
  {...$$restProps}
>
  <slot />
</svelte:element>
