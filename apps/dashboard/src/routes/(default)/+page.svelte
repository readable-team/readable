<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import { accessToken, trpc } from '$lib/trpc';
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
      $accessToken = null;

      await invalidateAll();
    }}
  >
    Logout
  </button>
{/await}
