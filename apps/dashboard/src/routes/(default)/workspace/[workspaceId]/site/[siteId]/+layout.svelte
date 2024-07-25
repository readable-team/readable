<script lang="ts">
  import { flex } from '@readable/styled-system/patterns';
  import Sidebar from '$lib/components/Sidebar.svelte';

  export let data;
</script>

<div
  class={flex({
    height: 'screen',
  })}
>
  <Sidebar sitePath={`/workspace/${data.workspaceId}/site/${data.siteId}`} usersiteUrl={data.usersiteUrl} />
  <div
    class={flex({
      flexDirection: 'column',
      flexGrow: 1,
    })}
  >
    <slot />
  </div>
</div>
