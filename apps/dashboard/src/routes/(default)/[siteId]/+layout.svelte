<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { HorizontalDivider, Icon } from '@readable/ui/components';
  import { onMount } from 'svelte';
  import HouseIcon from '~icons/lucide/house';
  import SettingsIcon from '~icons/lucide/settings';
  import ReadableIcon from '~icons/rdbl/readable';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { graphql } from '$graphql';
  import { Img } from '$lib/components';
  import { PageList } from '$lib/components/page-list';
  import SiteSettingModal from './SiteSettingModal.svelte';
  import UserMenu from './UserMenu.svelte';
  import type { PageData, SectionData } from '$lib/components/page-list/types';

  let openSiteSettingModal = false;
  $: openSiteSettingModal = $page.url.hash.startsWith('#/settings/site');

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

        logo {
          id
          ...Img_image
        }

        # NOTE: maxDepth = 2
        sections {
          id
          name
          order
          __typename

          pages {
            id
            state
            order
            __typename

            section {
              id
            }

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
              __typename

              section {
                id
              }

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

        ...SiteSettingModal_site
      }
    }
  `);

  const createSection = graphql(`
    mutation SiteLayout_CreateSection_Mutation($input: CreateSectionInput!) {
      createSection(input: $input) {
        id
        name
        order
        __typename
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

  const updateSectionPosition = graphql(`
    mutation SiteLayout_UpdateSectionPosition_Mutation($input: UpdateSectionPositionInput!) {
      updateSectionPosition(input: $input) {
        id
        order
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

  async function onCreatePage(parent: SectionData | PageData) {
    const createPageInput: Parameters<typeof createPage>[0] = {
      siteId: $query.site.id,
      sectionId: '',
      parentId: '',
    };

    if (parent.__typename === 'Section') {
      createPageInput.sectionId = parent.id;
      createPageInput.parentId = null;
    } else {
      createPageInput.sectionId = parent.section.id;
      createPageInput.parentId = parent.id;
    }

    const page = await createPage(createPageInput);

    await goto(`/${$query.site.id}/${page.id}`);
  }

  async function onDropPage(target: {
    sectionId: string;
    pageId: string;
    parentId: string | null;
    previousOrder?: string;
    nextOrder?: string;
  }) {
    await updatePagePosition({
      sectionId: target.sectionId,
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

<div class={flex({ flexDirection: 'column', height: 'screen' })}>
  <header
    class={flex({
      justifyContent: 'space-between',
      height: '52px',
      borderBottomWidth: '1px',
      borderBottomColor: 'border.secondary',
      paddingLeft: '20px',
      paddingRight: '16px',
      paddingY: '10px',
    })}
  >
    <div
      class={flex({
        gap: '8px',
        alignItems: 'center',
        paddingX: '8px',
        paddingY: '6px',
      })}
    >
      <Icon icon={ReadableIcon} size={18} />
      <svg fill="none" height="12" viewBox="0 0 5 12" width="5" xmlns="http://www.w3.org/2000/svg">
        <path d="M4.52876 0.102272L1.48189 11.4219H0.24929L3.29617 0.102272H4.52876Z" fill="#ECEDEE" />
      </svg>
      {#if $query.site.logo}
        <Img
          style={css.raw({ borderRadius: 'full', size: '19px', borderWidth: '1px', borderColor: 'border.image' })}
          $image={$query.site.logo}
          alt={`${$query.site.name}의 로고`}
          size={48}
        />
      {/if}
      <h1 class={css({ textStyle: '14m' })}>
        {$query.site.name}
      </h1>
    </div>
    <UserMenu {$query} />
  </header>

  <div
    class={flex({
      flex: '1',
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
              aria-selected={$page.url.pathname === `/${$query.site.id}/`}
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
              href="#/settings/site"
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
            items={$query.site.sections}
            onCreate={onCreatePage}
            onCreateSection={async () => {
              await createSection({
                siteId: $query.site.id,
                lower: $query.site.sections.at(-1)?.order,
              });
            }}
            onDrop={onDropPage}
            onDropSection={async (target) => {
              await updateSectionPosition({
                sectionId: target.sectionId,
                lower: target.previousOrder,
                upper: target.nextOrder,
              });
            }}
          />
        </div>
      </nav>
    </aside>

    <div
      class={flex({
        direction: 'column',
        grow: 1,
        paddingTop: '30px',
        backgroundColor: 'sidebar.surface',
        width: 'full',
        truncate: true,
      })}
    >
      <div
        class={flex({
          'direction': 'column',
          'grow': 1,
          'borderTopLeftRadius': '[36px]',
          'paddingTop': '28px',
          'backgroundColor': 'surface.primary',
          'overflowY': 'auto',

          '&:has(.has-slash-menu)': {
            overflowY: 'hidden',
          },
        })}
      >
        <slot />
      </div>
    </div>
  </div>
</div>

<SiteSettingModal $site={$query.site} $user={$query.me} bind:open={openSiteSettingModal} />
