<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { getContext } from 'svelte';
  import type { SystemStyleObject } from '@readable/styled-system/types';
  import type { DragEventHandler } from 'svelte/elements';

  export let style: SystemStyleObject | undefined = undefined;

  const onDragStart = getContext<DragEventHandler<HTMLDivElement>>('onDragStart');
</script>

<div
  {...$$restProps}
  class={css({ whiteSpace: 'normal' }, style)}
  data-node-view
  role="presentation"
  on:dragstart={onDragStart}
>
  <slot />
</div>
