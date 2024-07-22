<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import Img from '$lib/components/Img.svelte';
  import { accessToken, trpc } from '$lib/trpc';
  import { css } from '$styled-system/css';
</script>

<div class={css({ fontSize: '32px', fontWeight: 'bold', marginBottom: '12px' })}>dashboard</div>

{#await trpc.user.me.query() then me}
  <Img
    id={me.avatarId}
    style={css.raw({
      borderRadius: 'full',
      size: '64px',
      marginBottom: '4px',
    })}
    alt={`${me.name}의 아바타`}
  />

  <div>ID: {me.id}</div>
  <div>Name: {me.name}</div>
  <div>Email: {me.email}</div>

  <button
    class={css({ marginTop: '12px' })}
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
