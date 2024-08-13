<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import placeholderSvg from '../../assets/logo-placeholder.svg';
  import type { SystemStyleObject } from '@readable/styled-system/types';

  export let style: SystemStyleObject | undefined = undefined;
</script>

<div class={css({ borderRadius: '8px', overflow: 'hidden' }, style)}>
  <img
    class={css({
      display: 'block',
      width: 'full',
      height: 'full',
    })}
    alt=""
    src={placeholderSvg}
  />
</div>
