<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import { trpc } from '$lib/trpc';
</script>

dashboard
<br />

{#await trpc.user.me.query() then me}
  Hello, {me.email}

  <br />

  <button
    type="button"
    on:click={async () => {
      await trpc.auth.logout.mutate();
      await invalidateAll();
    }}
  >
    Logout
  </button>
{/await}
