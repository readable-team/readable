<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { HorizontalDivider, Icon, LogoPlaceholder, Menu, MenuItem } from '@readable/ui/components';
  import { onMount } from 'svelte';
  import ChevronsUpDownIcon from '~icons/lucide/chevrons-up-down';
  import ExternalLinkIcon from '~icons/lucide/external-link';
  import HouseIcon from '~icons/lucide/house';
  import PlusIcon from '~icons/lucide/plus';
  import SettingsIcon from '~icons/lucide/settings';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { graphql } from '$graphql';
  import { PageList } from '$lib/components/page-list';
  import SiteSettingModal from './SiteSettingModal.svelte';
  import UserMenu from './UserMenu.svelte';

  let openSiteSettingModal = false;
  $: openSiteSettingModal = $page.url.hash === '#site-settings' || $page.url.hash === '#design-settings';

  $: query = graphql(`
    query SiteLayout_Query($siteId: ID!) {
      ...UserMenu_query

      me @required {
        id

        ...SiteSettingModal_user
      }

      site(siteId: $siteId) {
        id
        name
        url

        # NOTE: maxDepth = 3
        pages {
          id
          state
          order

          content {
            id
            title
          }

          parent {
            id
          }

          children {
            id
            state
            order

            content {
              id
              title
            }

            parent {
              id
            }

            children {
              id
              state
              order

              content {
                id
                title
              }

              parent {
                id
              }

              children {
                id
                state
                order

                content {
                  id
                  title
                }

                parent {
                  id
                }
              }
            }
          }
        }

        team {
          id

          sites {
            id
            name
          }
        }

        ...SiteSettingModal_site
      }
    }
  `);

  const createPage = graphql(`
    mutation SiteLayout_CreatePage_Mutation($input: CreatePageInput!) {
      createPage(input: $input) {
        id
      }
    }
  `);

  const updatePagePosition = graphql(`
    mutation SiteLayout_UpdatePagePosition_Mutation($input: UpdatePagePositionInput!) {
      updatePagePosition(input: $input) {
        id
      }
    }
  `);

  const siteUpdateStream = graphql(`
    subscription SiteLayout_SiteUpdateStream_Subscription($siteId: ID!) {
      siteUpdateStream(siteId: $siteId) {
        __typename

        ... on Site {
          id
        }

        ... on Page {
          id
          state
          hasUnpublishedChanges

          content {
            id
            title
          }
        }
      }
    }
  `);

  siteUpdateStream.on('data', (data) => {
    if (data.siteUpdateStream.__typename === 'Site') {
      query.refetch();
    }
  });

  async function onCreatePage(parentId: string | null) {
    const page = await createPage({
      siteId: $query.site.id,
      parentId,
    });

    await goto(`/${$query.site.id}/${page.id}`);
  }

  async function onDropPage(target: {
    pageId: string;
    parentId: string | null;
    previousOrder?: string;
    nextOrder?: string;
  }) {
    await updatePagePosition({
      pageId: target.pageId,
      parentId: target.parentId,
      lower: target.previousOrder,
      upper: target.nextOrder,
    });

    query.refetch(); // FIXME: cache invalidation

    return true;
  }

  const sidebarMenuItemStyle = flex({
    alignItems: 'center',
    gap: '13px',
    flex: '1',
    borderRadius: '6px',
    paddingX: '12px',
    paddingY: '8px',
    textStyle: '16m',
    color: 'text.tertiary',
    width: 'full',
    height: '39px',
    _hover: {
      backgroundColor: 'surface.secondary', // TODO: 다시 지정 필요
    },
    _selected: {
      backgroundColor: 'surface.secondary', // TODO: 다시 지정 필요
      color: 'text.secondary',
    },
  });

  onMount(() => {
    const unsubscribe = siteUpdateStream.subscribe({
      siteId: $query.site.id,
    });

    return () => {
      unsubscribe();
    };
  });
</script>

<div
  class={flex({
    height: 'screen',
    overflow: 'auto',
  })}
>
  <aside
    class={flex({
      flexDirection: 'column',
      flex: 'none',
      paddingTop: '30px',
      paddingX: '10px',
      paddingBottom: '36px',
      backgroundColor: 'sidebar.surface',
      width: '300px',
      overflowY: 'auto',
    })}
  >
    <Menu listStyle={css.raw({ maxHeight: '324px' })} placement="bottom" setFullWidth>
      <div
        slot="button"
        class={css(
          {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            borderRadius: '8px',
            paddingX: '10px',
            paddingY: '8px',
          },
          open && { backgroundColor: 'neutral.10' },
        )}
        let:open
      >
        <div class={flex({ align: 'center', gap: '10px', truncate: true })}>
          <LogoPlaceholder size={32} />
          <h1 class={css({ textStyle: '16b', truncate: true })}>
            {$query.site.name}
          </h1>
        </div>
        <Icon style={css.raw({ color: 'text.secondary' })} icon={ChevronsUpDownIcon} size={18} />
      </div>

      {#each $query.site.team.sites as site (site.id)}
        <MenuItem aria-selected={site.id === $query.site.id} on:click={async () => await goto(`/${site.id}`)}>
          <LogoPlaceholder slot="prefix" size={20} />
          {site.name}
        </MenuItem>
      {/each}

      <HorizontalDivider />

      <button
        class={flex({
          align: 'center',
          gap: '6px',
          borderRadius: '8px',
          paddingX: '12px',
          paddingY: '9px',
          textStyle: '15sb',
          color: 'text.tertiary',
          _hover: { backgroundColor: 'neutral.10' },
        })}
        type="button"
      >
        <Icon icon={PlusIcon} size={20} />
        <span>사이트 만들기</span>
      </button>
    </Menu>

    <a
      class={flex({
        align: 'center',
        justify: 'space-between',
        marginTop: '14px',
        borderWidth: '1px',
        borderColor: 'border.secondary',
        borderRadius: '10px',
        paddingLeft: '22px',
        paddingY: '14px',
        paddingRight: '19px',
        textStyle: '16m',
        color: 'text.secondary',
        backgroundColor: 'surface.primary',
        truncate: true,
      })}
      href={$query.site.url}
      rel="noopener noreferrer"
      target="_blank"
      type="link"
    >
      <span class={css({ truncate: true })}>{$query.site.url}</span>

      <Icon style={css.raw({ color: 'text.tertiary' })} icon={ExternalLinkIcon} size={20} />
    </a>

    <nav class={css({ marginTop: '24px', marginBottom: 'auto' })}>
      <ul
        class={flex({
          flexDirection: 'column',
          gap: '7px',
        })}
      >
        <li>
          <a
            class={sidebarMenuItemStyle}
            aria-selected={$page.url.pathname === `/${$query.site.id}`}
            href={`/${$query.site.id}`}
            role="tab"
          >
            <Icon style={css.raw({ color: 'text.tertiary' })} icon={HouseIcon} size={20} />
            <span>홈</span>
          </a>
        </li>
        <li>
          <a
            class={sidebarMenuItemStyle}
            data-sveltekit-preload-data="false"
            href="#site-settings"
            role="tab"
            type="button"
          >
            <Icon style={css.raw({ color: 'text.tertiary' })} icon={SettingsIcon} size={20} />
            <span>설정</span>
          </a>
        </li>
      </ul>

      <HorizontalDivider style={css.raw({ marginTop: '24px', marginBottom: '28px', height: '2px' })} />

      <div role="tree">
        <PageList
          getPageUrl={(page) => `/${$query.site.id}/${page.id}`}
          items={$query.site.pages}
          onCreate={onCreatePage}
          onDrop={onDropPage}
        />
      </div>
    </nav>

    <UserMenu {$query} />
  </aside>

  <div
    class={flex({
      direction: 'column',
      grow: 1,
      paddingTop: '30px',
      backgroundColor: 'sidebar.surface',
      width: 'full',
    })}
  >
    <div
      class={flex({
        direction: 'column',
        grow: 1,
        borderTopLeftRadius: '[36px]',
        paddingTop: '32px',
        paddingX: '80px',
        backgroundColor: 'surface.primary',
        overflowY: 'auto',
      })}
    >
      <slot />
    </div>
  </div>
</div>

<SiteSettingModal $site={$query.site} $user={$query.me} bind:open={openSiteSettingModal} />
