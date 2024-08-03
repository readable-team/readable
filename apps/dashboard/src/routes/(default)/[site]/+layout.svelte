<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Button, HorizontalDivider, Icon, LogoPlaceholder, Menu, MenuItem } from '@readable/ui/components';
  import { onMount } from 'svelte';
  import ChevronDownIcon from '~icons/lucide/chevron-down';
  import HouseIcon from '~icons/lucide/house';
  import PlusIcon from '~icons/lucide/plus';
  import SettingsIcon from '~icons/lucide/settings';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { graphql } from '$graphql';
  import Img from '$lib/components/Img.svelte';
  import { PageList } from '$lib/components/page-list';
  import { buildPageFullSlug } from '$lib/utils/url';
  import SettingModal from './SettingModal.svelte';

  let openSettingModal = false;
  $: openSettingModal = $page.url.hash === '#settings';

  $: query = graphql(`
    query SiteLayout_Query($slug: String!) {
      me @required {
        id
        name
        avatarUrl

        ...SettingModal_user
      }

      site(slug: $slug) {
        id
        name
        slug
        url

        # NOTE: maxDepth = 3
        pages {
          id
          state
          slug
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
            slug
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
              slug
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
                slug
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
            slug
          }
        }

        ...SettingModal_site
      }
    }
  `);

  const createPage = graphql(`
    mutation SiteLayout_CreatePage_Mutation($input: CreatePageInput!) {
      createPage(input: $input) {
        id
        slug

        content {
          id
          title
        }
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

    await goto(`/${$query.site.slug}/${buildPageFullSlug(page)}`);
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
    gap: '6px',
    flex: '1',
    paddingX: '6px',
    textStyle: '15sb',
    color: 'text.primary',
    width: 'full',
    height: '34px',
    _hover: {
      borderRadius: '6px',
      backgroundColor: 'neutral.10',
    },
    _selected: {
      'borderRadius': '6px',
      'backgroundColor': 'accent.10',
      'color': 'text.accent',
      '& svg': {
        color: 'text.accent',
      },
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
    flexDirection: 'column',
    height: 'screen',
  })}
>
  <header
    class={flex({
      align: 'center',
      justifyContent: 'space-between',
      position: 'relative',
      borderBottomWidth: '1px',
      borderColor: 'border.secondary',
      height: '60px',
      paddingX: '10px',
      paddingY: '11px',
    })}
  >
    <Menu listStyle={css.raw({ width: '234px' })} placement="bottom-start">
      <div
        slot="button"
        class={css(
          {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            borderRadius: '10px',
            padding: '6px',
            width: '234px',
            _hover: { backgroundColor: 'neutral.10' },
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
        <Icon style={css.raw({ color: 'neutral.70' })} icon={ChevronDownIcon} size={20} />
      </div>

      {#each $query.site.team.sites as site (site.id)}
        <MenuItem aria-selected={site.id === $query.site.id} on:click={async () => await goto(`/${site.slug}`)}>
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

    <div
      class={css({
        position: 'absolute',
        translate: 'auto',
        left: '1/2',
        translateX: '-1/2',
        marginX: 'auto',
        borderWidth: '1px',
        borderColor: 'neutral.20',
        borderRadius: '8px',
        paddingX: '14px',
        paddingY: '9px',
        textStyle: '14m',
        textAlign: 'center',
        color: 'text.secondary',
        backgroundColor: 'neutral.10',
        minWidth: '380px',
      })}
    >
      {$query.site.url}
    </div>

    <div class={flex({ align: 'center', gap: '20px' })}>
      <Button href={$query.site.url} rel="noopener noreferrer" target="_blank" type="link" variant="secondary">
        사이트 바로가기
      </Button>

      <Img
        style={css.raw({ borderWidth: '1px', borderColor: 'border.image', borderRadius: 'full', size: '38px' })}
        alt={`${$query.me.name}의 아바타`}
        url={$query.me.avatarUrl}
      />
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
          <li>
            <a
              class={sidebarMenuItemStyle}
              aria-selected={$page.url.pathname === `/${$query.site.slug}`}
              href={`/${$query.site.slug}`}
              role="tab"
            >
              <Icon style={css.raw({ color: 'text.secondary' })} icon={HouseIcon} />
              <span>홈</span>
            </a>
          </li>
          <li>
            <button
              class={sidebarMenuItemStyle}
              role="tab"
              type="button"
              on:click={() => {
                goto('#settings');
              }}
            >
              <Icon style={css.raw({ color: 'text.secondary' })} icon={SettingsIcon} />
              <span>설정</span>
            </button>
          </li>
        </ul>

        <HorizontalDivider style={css.raw({ marginY: '10px' })} />

        <div role="tree">
          <PageList
            getPageUrl={(page) => `/${$query.site.slug}/${buildPageFullSlug(page)}`}
            items={$query.site.pages}
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

<SettingModal
  $site={$query.site}
  $user={$query.me}
  close={() => {
    const currentPath = $page.url.pathname;
    goto(currentPath, { replaceState: true });
  }}
  bind:open={openSettingModal}
/>
