<script lang="ts">
  import '../app.css';

  import { css } from '@readable/styled-system/css';
  import { ToastProvider } from '@readable/ui/notification';
</script>

<div
  class={css({
    minWidth: '1280px',
  })}
>
  <slot />
</div>

<ToastProvider />
