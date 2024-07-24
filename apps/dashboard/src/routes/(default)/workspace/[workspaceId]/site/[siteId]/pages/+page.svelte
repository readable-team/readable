<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Button, Icon, Test } from '@readable/ui/components';
  import LayoutDashboardIcon from '~icons/lucide/layout-dashboard';
  import { invalidateAll } from '$app/navigation';
  import Img from '$lib/components/Img.svelte';
  import { accessToken, trpc } from '$lib/trpc';
</script>

<div class={flex({ align: 'center', gap: '4px', fontSize: '32px', fontWeight: 'bold', marginBottom: '12px' })}>
  <Icon icon={LayoutDashboardIcon} size={32} />
  dashboard
</div>

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

  <Button
    style={{ marginTop: '12px' }}
    size="sm"
    type="button"
    variant="primary"
    on:click={async () => {
      await trpc.auth.logout.mutate();
      $accessToken = null;

      await invalidateAll();
    }}
  >
    Logout
  </Button>
{/await}

<Test />
