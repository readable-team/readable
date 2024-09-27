<script lang="ts">
  import '../app.css';

  import { ToastProvider } from '@readable/ui/notification';
</script>

<slot />
<ToastProvider />
