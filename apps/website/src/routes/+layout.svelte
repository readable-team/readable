<script lang="ts">
  import '../app.css';

  import { flex } from '@readable/styled-system/patterns';
</script>

<div class={flex({ direction: 'column', grow: '1', minHeight: 'screen' })}>
  <slot />
</div>
