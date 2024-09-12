<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import mixpanel from 'mixpanel-browser';
  import { goto } from '$app/navigation';
  import { fragment, graphql } from '$graphql';
  import { treeOpenState } from '$lib/svelte/stores/ui';
  import { PageList } from './(pageTree)';
  import type { LeftSideBar_site } from '$graphql';
  import type { CategoryData, PageData } from './(pageTree)/types';

  let _site: LeftSideBar_site;
  export { _site as $site };

  $: site = fragment(
    _site,
    graphql(`
      fragment LeftSideBar_site on Site {
        id

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
    `),
  );

  async function onCreatePage(parent: CategoryData | PageData) {
    const createPageInput: Parameters<typeof createPage>[0] = {
      siteId: $site.id,
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

    mixpanel.track('page:create', {
      depth: parent.__typename === 'Category' ? 1 : 2,
    });

    await goto(`/${$site.id}/${page.id}`);
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

    mixpanel.track('page:move');

    return true;
  }

  const createCategory = graphql(`
    mutation LeftSideBar_CreateCategory_Mutation($input: CreateCategoryInput!) {
      createCategory(input: $input) {
        id
        name
        order
        __typename
      }
    }
  `);

  const updateCategoryPosition = graphql(`
    mutation LeftSideBar_UpdateCategoryPosition_Mutation($input: UpdateCategoryPositionInput!) {
      updateCategoryPosition(input: $input) {
        id
        order
      }
    }
  `);

  const createPage = graphql(`
    mutation LeftSideBar_CreatePage_Mutation($input: CreatePageInput!) {
      createPage(input: $input) {
        id
      }
    }
  `);

  const updatePagePosition = graphql(`
    mutation LeftSideBar_UpdatePagePosition_Mutation($input: UpdatePagePositionInput!) {
      updatePagePosition(input: $input) {
        id
      }
    }
  `);
</script>

<aside
  class={flex({
    flexDirection: 'column',
    flex: 'none',
    backgroundColor: 'surface.secondary',
    minWidth: '240px',
    width: '[18.75%]',
    maxWidth: '360px',
    borderRightWidth: '1px',
    borderColor: 'border.secondary',
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
        getPageUrl={(page) => `/${$site.id}/${page.id}`}
        items={$site.categories}
        onCreate={onCreatePage}
        onCreateCategory={async () => {
          await createCategory({
            siteId: $site.id,
            lower: $site.categories.at(-1)?.order,
          });

          mixpanel.track('category:create');
        }}
        onDrop={onDropPage}
        onDropCategory={async (target) => {
          await updateCategoryPosition({
            categoryId: target.categoryId,
            lower: target.previousOrder,
            upper: target.nextOrder,
          });

          mixpanel.track('category:move');
        }}
        openState={$treeOpenState}
      />
    </div>
  </nav>
</aside>
