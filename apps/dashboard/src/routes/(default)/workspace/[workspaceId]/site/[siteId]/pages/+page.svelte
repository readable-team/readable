<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Button, Chip, Icon, LogoPlaceholder, TextInput, Tooltip } from '@readable/ui/components';
  import ChevronDownIcon from '~icons/lucide/chevron-down';
  import LayoutDashboardIcon from '~icons/lucide/layout-dashboard';
  import MailIcon from '~icons/lucide/mail';
  import { goto, invalidateAll } from '$app/navigation';
  import { graphql } from '$graphql';
  import Img from '$lib/components/Img.svelte';
  import { accessToken } from '$lib/graphql';
  import Pages from './Pages.svelte';

  $: query = graphql(`
    query SitePagesPage_Query($workspaceId: ID!, $siteId: ID!) {
      me @required {
        id
        name
        email
        avatarUrl
      }

      workspace(workspaceId: $workspaceId) {
        id
      }

      site(siteId: $siteId) {
        id
        name
        url
      }
    }
  `);

  const createPage = graphql(`
    mutation SitePagesPage_CreatePage_Mutation($input: CreatePageInput!) {
      createPage(input: $input) {
        id
      }
    }
  `);

  const logout = graphql(`
    mutation SitePagesPage_Logout_Mutation {
      logout
    }
  `);
</script>

<div class={flex({ align: 'center', gap: '4px', fontSize: '32px', fontWeight: 'bold', marginBottom: '12px' })}>
  <Icon icon={LayoutDashboardIcon} size={32} />
  dashboard
</div>

<LogoPlaceholder size={20} />
<LogoPlaceholder size={32} />

<Tooltip message="안녕하세요안녕하세요안녕하세요안녕하세요안녕하세요안녕하세요안녕하세요" placement="right">
  <Img
    style={css.raw({
      borderRadius: 'full',
      size: '64px',
      marginBottom: '4px',
    })}
    alt={`${$query.me.name}의 아바타`}
    url={$query.me.avatarUrl}
  />
</Tooltip>

<div>ID: {$query.me.id}</div>
<div>Name: {$query.me.name}</div>
<div>Email: {$query.me.email}</div>

<button
  type="button"
  on:click={async () => {
    const page = await createPage({ siteId: $query.site.id });

    await goto(`/workspace/${$query.workspace.id}/site/${$query.site.id}/pages/${page.id}`);
  }}
>
  새 페이지
</button>

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
    await logout();
    $accessToken = null;

    await invalidateAll();
  }}
>
  Logout
</Button>
