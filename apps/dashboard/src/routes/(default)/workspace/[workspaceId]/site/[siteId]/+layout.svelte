<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Button, Icon, LogoPlaceholder, Menu, MenuItem } from '@readable/ui/components';
  import ChevronDownIcon from '~icons/lucide/chevron-down';
  import HouseIcon from '~icons/lucide/house';
  import SettingsIcon from '~icons/lucide/settings';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
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

  $: sidebarMenu = [
    {
      href: `/workspace/${$query.workspace.id}/site/${$query.site.id}/pages`, // FIXME: '홈' 페이지 필요
      text: '홈',
      icon: HouseIcon,
    },
    {
      href: `/workspace/${$query.workspace.id}/site/${$query.site.id}/settings`,
      text: '설정',
      icon: SettingsIcon,
    },
  ];
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
        <MenuItem
          aria-selected={site.id === $query.site.id}
          on:click={async () => await goto(`/workspace/${$query.workspace.id}/site/${site.id}`)}
        >
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
        borderRightWidth: '1px',
        borderColor: 'divider.secondary',
      })}
    >
      <nav>
        <ul
          class={flex({
            flexDirection: 'column',
            gap: '2px',
          })}
        >
          {#each sidebarMenu as item (item.href)}
            <li>
              <a
                class={flex({
                  width: 'full',
                  height: '34px',
                  paddingX: '6px',
                  flex: '1',
                  alignItems: 'center',
                  gap: '6px',
                  _hover: {
                    borderRadius: '6px',
                    backgroundColor: 'neutral.10',
                  },
                  _selected: {
                    borderRadius: '6px',
                    backgroundColor: 'accent.10',
                    color: 'text.accent',
                  },
                })}
                aria-current={$page.url.pathname.startsWith(item.href) ? 'page' : undefined}
                aria-selected={$page.url.pathname.startsWith(item.href) ? 'true' : 'false'}
                href={item.href}
                role="tab"
              >
                <Icon
                  style={css.raw({
                    color: 'text.secondary',
                  })}
                  icon={item.icon}
                  size={16}
                />
                <span
                  class={css({
                    textStyle: '15sb',
                    color: 'text.primary',
                  })}
                >
                  {item.text}
                </span>
              </a>
            </li>
          {/each}
        </ul>

        <hr class={css({ marginY: '10px', borderColor: 'divider.primary' })} />

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
