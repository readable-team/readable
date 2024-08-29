<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Button, Icon } from '@readable/ui/components';
  import { onMount } from 'svelte';
  import ReadableIcon from '~icons/rdbl/readable';
  import SlashDividerIcon from '~icons/rdbl/slash-divider';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { graphql } from '$graphql';
  import { Img, Tabs } from '$lib/components';
  import { PageList } from './(pageTree)';
  import UserMenu from './UserMenu.svelte';
  import type { CategoryData, PageData } from './(pageTree)/types';

  $: query = graphql(`
    query SiteLayout_Query($siteId: ID!) {
      ...UserMenu_query

      me @required {
        id
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
        categories {
          id
          name
          order
          __typename

          pages {
            id
            state
            order
            __typename

            category {
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

              category {
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
      }
    }
  `);

  const createCategory = graphql(`
    mutation SiteLayout_CreateCategory_Mutation($input: CreateCategoryInput!) {
      createCategory(input: $input) {
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

  const updateCategoryPosition = graphql(`
    mutation SiteLayout_UpdateCategoryPosition_Mutation($input: UpdateCategoryPositionInput!) {
      updateCategoryPosition(input: $input) {
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

  async function onCreatePage(parent: CategoryData | PageData) {
    const createPageInput: Parameters<typeof createPage>[0] = {
      siteId: $query.site.id,
      categoryId: '',
      parentId: '',
    };

    if (parent.__typename === 'Category') {
      createPageInput.categoryId = parent.id;
      createPageInput.parentId = null;
    } else {
      createPageInput.categoryId = parent.category.id;
      createPageInput.parentId = parent.id;
    }

    const page = await createPage(createPageInput);

    await goto(`/${$query.site.id}/${page.id}`);
  }

  async function onDropPage(target: {
    categoryId: string;
    pageId: string;
    parentId: string | null;
    previousOrder?: string;
    nextOrder?: string;
  }) {
    await updatePagePosition({
      categoryId: target.categoryId,
      pageId: target.pageId,
      parentId: target.parentId,
      lower: target.previousOrder,
      upper: target.nextOrder,
    });

    query.refetch(); // FIXME: cache invalidation

    return true;
  }

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
      height: '48px',
      paddingLeft: '20px',
      paddingRight: '16px',
      paddingY: '10px',
      backgroundColor: 'surface.primary',
    })}
  >
    <div
      class={flex({
        gap: '2px',
        alignItems: 'center',
        paddingX: '8px',
        paddingY: '6px',
      })}
    >
      <Icon icon={ReadableIcon} size={18} />
      <Icon icon={SlashDividerIcon} size={18} />
      {#if $query.site.logo}
        <Img
          style={css.raw({ borderRadius: 'full', size: '19px', borderWidth: '1px', borderColor: 'border.image' })}
          $image={$query.site.logo}
          alt={`${$query.site.name}의 로고`}
          size={48}
        />
      {/if}
      <h1 class={css({ textStyle: '14sb' })}>
        {$query.site.name}
      </h1>
    </div>
    <UserMenu {$query} />
  </header>

  <nav
    class={flex({
      align: 'center',
      justify: 'space-between',
      borderBottomWidth: '1px',
      borderColor: 'border.primary',
      paddingX: '20px',
      height: '46px',
    })}
  >
    <Tabs
      tabs={[
        {
          title: '콘텐츠',
          path: `/${$query.site.id}`,
          selected:
            $page.url.pathname.startsWith(`/${$query.site.id}`) &&
            !$page.url.pathname.startsWith(`/${$query.site.id}/settings`),
        },
        {
          title: '사이트 설정',
          path: `/${$query.site.id}/settings`,
          selected: `/${$query.site.id}/settings/` === $page.url.pathname,
        },
      ]}
    />

    <Button href={$query.site.url} rel="noopener noreferrer" size="sm" target="_blank" type="link" variant="secondary">
      사이트 바로가기
    </Button>
  </nav>

  <div
    class={flex({
      flex: '1',
      overflow: 'auto',
    })}
  >
    <aside
      class={flex({
        flexDirection: 'column',
        flex: 'none',
        backgroundColor: 'surface.secondary',
        minWidth: '240px',
        width: '[18.75%]',
        maxWidth: '380px',
        borderRightWidth: '1px',
        borderColor: 'border.primary',
        overflowY: 'auto',
      })}
    >
      <nav class={flex({ flex: '1', flexDirection: 'column', overflow: 'auto' })}>
        <div
          class={css({
            flex: '1',
            padding: '20px',
            paddingBottom: '120px',
            overflow: 'auto',
          })}
          role="tree"
        >
          <PageList
            getPageUrl={(page) => `/${$query.site.id}/${page.id}`}
            items={$query.site.categories}
            onCreate={onCreatePage}
            onCreateCategory={async () => {
              await createCategory({
                siteId: $query.site.id,
                lower: $query.site.categories.at(-1)?.order,
              });
            }}
            onDrop={onDropPage}
            onDropCategory={async (target) => {
              await updateCategoryPosition({
                categoryId: target.categoryId,
                lower: target.previousOrder,
                upper: target.nextOrder,
              });
            }}
          />
        </div>
      </nav>
    </aside>

    <slot />
  </div>
</div>
