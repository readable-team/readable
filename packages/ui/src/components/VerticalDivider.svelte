<script lang="ts">
  import { css, cva, cx } from '@readable/styled-system/css';
  import type { SystemStyleObject } from '@readable/styled-system/types';

  export let color: 'primary' | 'secondary' = 'primary';
  export let style: SystemStyleObject | undefined = undefined;
</script>

<hr
  class={cx(
    cva({
      base: {
        border: 'none',
        width: '1px',
        height: 'full',
        flexShrink: 0,
      },
      variants: {
        color: {
          primary: { backgroundColor: 'divider.primary' },
          secondary: { backgroundColor: 'divider.secondary' },
        },
      },
    })({ color }),
    css(style),
  )}
/>
