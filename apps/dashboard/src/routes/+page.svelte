<script lang="ts">
  import { trpc } from '$lib/trpc';
</script>

dashboard
<br />

{#await trpc.getUserById.query('1')}
  loading...
{:then value}
  {value}
{/await}
