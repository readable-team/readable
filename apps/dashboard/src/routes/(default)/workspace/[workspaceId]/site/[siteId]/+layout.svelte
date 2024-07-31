<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Button, Icon, LogoPlaceholder, Menu, MenuItem } from '@readable/ui/components';
  import ChevronDownIcon from '~icons/lucide/chevron-down';
  import { goto } from '$app/navigation';
  import { graphql } from '$graphql';
  import { PageList } from '$lib/components/page-list';

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

  const dummyPages = [
    {
      id: '더미 페이지',
      order: 'a0',
      parentId: null,
      children: [
        {
          order: 'a0',
          id: '페이지 2',
          parentId: '더미 페이지',
          children: [
            {
              order: 'a0',
              id: '페이지 3',
              parentId: '페이지 2',
            },
          ],
        },
        {
          order: 'a1',
          id: '페이지 4',
          parentId: '더미 페이지',
        },
        {
          order: 'a2',
          id: '페이지 5',
          parentId: '더미 페이지',
        },
      ],
    },
    {
      id: '페이지 1',
      order: 'a1',
      parentId: null,
      state: 'DRAFT',
    },
  ];

  async function onCreatePage(parentId: string | null) {
    console.log('onCreatePage', parentId);
  }

  async function onDropPage(target: {
    pageId: string;
    parentId: string | null;
    previousOrder?: string;
    nextOrder?: string;
  }) {
    console.log('onDropPage', target);
  }
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
      flex: '1',
      overflow: 'auto',
    })}
  >
    <aside
      class={flex({
        flexDirection: 'column',
        gap: '10px',
        width: '280px',
        padding: '16px',
        backgroundColor: 'white',
        flexShrink: 0,
        overflowY: 'auto',
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

        <div role="tree">
          <PageList
            getPageUrl={(pageId) => `/workspace/${$query.workspace.id}/site/${$query.site.id}/pages/${pageId}`}
            items={dummyPages}
            onCancel={console.log}
            onCreate={onCreatePage}
            onDrop={onDropPage}
          />
        </div>
      </nav>
    </aside>

    <div
      class={flex({
        flexDirection: 'column',
        overflowY: 'auto',
        flexGrow: 1,
        flexShrink: 0,
      })}
    >
      <slot />
    </div>
  </div>
</div>
