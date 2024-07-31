<script lang="ts">
  import { css } from '@readable/styled-system/css';
</script>

<div
  class={css({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '19px',
    paddingX: '4px',
    borderRadius: '4px',
    textStyle: '12b',
    backgroundColor: 'accent.20',
    color: 'text.accent',
    flexShrink: 0,
  })}
>
  <slot />
</div>
