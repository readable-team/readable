<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Button, Chip, Icon, LogoPlaceholder, TextInput } from '@readable/ui/components';
  import ChevronDownIcon from '~icons/lucide/chevron-down';
  import LayoutDashboardIcon from '~icons/lucide/layout-dashboard';
  import MailIcon from '~icons/lucide/mail';
  import { invalidateAll } from '$app/navigation';
  import Img from '$lib/components/Img.svelte';
  import { accessToken, trpc } from '$lib/trpc';
  import Pages from './Pages.svelte';
</script>

<div class={flex({ align: 'center', gap: '4px', fontSize: '32px', fontWeight: 'bold', marginBottom: '12px' })}>
  <Icon icon={LayoutDashboardIcon} size={32} />
  dashboard
</div>

<LogoPlaceholder size={20} />
<LogoPlaceholder size={32} />

{#await trpc.user.me.query() then me}
  <Img
    style={css.raw({
      borderRadius: 'full',
      size: '64px',
      marginBottom: '4px',
    })}
    alt={`${me.name}의 아바타`}
    url={me.avatarUrl}
  />

  <div>ID: {me.id}</div>
  <div>Name: {me.name}</div>
  <div>Email: {me.email}</div>

  <br />
  <div class={flex({ alignItems: 'center', gap: '8px' })}><Chip>초안</Chip> 어쩌구</div>

  <div
    class={css({
      width: '400px',
      padding: '4px',
    })}
  >
    <TextInput leftIcon={MailIcon} message="Oh yeah" placeholder="이메일을 입력해주세요" rightIcon={ChevronDownIcon} />
    <TextInput
      error
      leftIcon={MailIcon}
      message="이메일이 올바르지 않습니다"
      placeholder="이메일을 입력해주세요"
      rightIcon={ChevronDownIcon}
      value="asdf"
    />
  </div>

  <br />
  <br />

  <Pages />

  <br />
  <br />

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
