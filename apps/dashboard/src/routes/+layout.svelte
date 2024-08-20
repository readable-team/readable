<script lang="ts">
  import '../app.css';

  import { flex } from '@readable/styled-system/patterns';
  import { ToastProvider } from '@readable/ui/notification';
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

<ToastProvider />
