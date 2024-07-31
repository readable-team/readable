<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Button, Icon, LogoPlaceholder, Menu, MenuItem } from '@readable/ui/components';
  import ChevronDownIcon from '~icons/lucide/chevron-down';
  import { goto } from '$app/navigation';
  import { graphql } from '$graphql';

  $: query = graphql(`
    query SiteLayout_Query($workspaceId: ID!, $siteId: ID!) {
      workspace(workspaceId: $workspaceId) {
        id

        sites {
          id
          name
        }
      }

      site(siteId: $siteId) {
        id
        name
        url
      }
    }
  `);
</script>

<div
  class={flex({
    flexDirection: 'column',
    height: 'screen',
  })}
>
  <header
    class={flex({
      justifyContent: 'space-between',
      borderBottomWidth: '1px',
      borderColor: 'border.primary',
      height: '60px',
      padding: '8px',
    })}
  >
    <Menu listStyle={css.raw({ width: '200px' })} placement="bottom-start">
      <div
        slot="button"
        class={flex({
          justify: 'space-between',
          width: '200px',
        })}
      >
        <div class={css({ display: 'flex' })}>
          <LogoPlaceholder size={20} />
          <h1>
            {$query.site.name}
          </h1>
        </div>
        <Icon icon={ChevronDownIcon} size={20} />
      </div>

      {#each $query.workspace.sites as site (site.id)}
        <MenuItem on:click={async () => await goto(`/workspace/${$query.workspace.id}/site/${site.id}`)}>
          {site.name}
        </MenuItem>
      {/each}
    </Menu>

    <div
      class={css({
        left: '0',
        right: '0',
        marginX: 'auto',
        width: '400px',
        backgroundColor: 'surface.secondary',
        borderRadius: '8px',
      })}
    >
      {$query.site.url}
    </div>

    <div
      class={flex({
        width: '200px',
      })}
    >
      <Button href={$query.site.url} rel="noopener noreferrer" target="_blank" type="link" variant="secondary">
        사이트 바로가기
      </Button>
      <div>프로필</div>
    </div>
  </header>

  <div
    class={flex({
      height: 'full',
    })}
  >
    <aside
      class={flex({
        flexDirection: 'column',
        gap: '10px',
        width: '232px',
        padding: '20px',
        backgroundColor: 'sidebar.surface',
        flexShrink: 0,
      })}
    >
      <nav>
        <ul
          class={flex({
            flexDirection: 'column',
            gap: '2px',
          })}
        >
          <li><a href={`/workspace/${$query.workspace.id}/site/${$query.site.id}/pages`}>페이지</a></li>
          <li><a href={`/workspace/${$query.workspace.id}/site/${$query.site.id}/designs`}>디자인</a></li>
          <li><a href={`/workspace/${$query.workspace.id}/site/${$query.site.id}/settings`}>설정</a></li>
        </ul>
      </nav>
    </aside>

    <div
      class={flex({
        width: 'full',
        flexDirection: 'column',
        flexGrow: 1,
      })}
    >
      <slot />
    </div>
  </div>
</div>
