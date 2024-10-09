<script lang="ts">
  import '../app.css';

  import { browser } from '$app/environment';
  import { hasCmd } from '$lib/stores/ui';

  export let data: { hasCmd: boolean };

  hasCmd.set(data.hasCmd);

  $: if (browser) {
    hasCmd.set(navigator.platform.toUpperCase().includes('MAC') || /(ipad|iphone|ipod)/i.test(navigator.userAgent));
  }
</script>

<slot />
