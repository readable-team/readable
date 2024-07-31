<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import type { SystemStyleObject } from '@readable/styled-system/types';

  export let style: SystemStyleObject | undefined = undefined;
</script>

<hr class={css({ border: 'none', height: '1px', backgroundColor: 'divider.primary' }, style)} />
