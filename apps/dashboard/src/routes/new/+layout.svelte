<script lang="ts">
  import { flex } from '@readable/styled-system/patterns';
</script>

<div
  class={flex({
    direction: 'column',
    grow: 1,
    minWidth: '1280px',
    minHeight: 'screen',
  })}
>
  <slot />
</div>
