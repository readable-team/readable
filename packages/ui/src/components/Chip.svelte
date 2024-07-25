<script lang="ts">
  import { css } from '@readable/styled-system/css';
</script>

<div
  class={css({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '25px',
    paddingX: '8px',
    borderRadius: '2px',
    textStyle: '13sb',
    backgroundColor: 'accent.60',
    color: 'neutral.0',
    flexShrink: 0,
  })}
>
  <slot />
</div>
