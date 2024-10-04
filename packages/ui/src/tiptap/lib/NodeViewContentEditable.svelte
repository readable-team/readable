<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import type { SystemStyleObject } from '@readable/styled-system/types';

  export let as: keyof HTMLElementTagNameMap = 'div';
  export let style: SystemStyleObject | undefined = undefined;
</script>

<svelte:element this={as} class={css(style)} data-node-view-content-editable {...$$restProps}>
  <slot />
</svelte:element>
