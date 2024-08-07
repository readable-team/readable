<script lang="ts">
  import { flex } from '@readable/styled-system/patterns';
  import { fragment, graphql } from '$graphql';
  import type { PagePage_Breadcrumb_query } from '$graphql';

  export let _query: PagePage_Breadcrumb_query;

  $: query = fragment(
    _query,
    graphql(`
      fragment PagePage_Breadcrumb_query on Query {
        page(pageId: $pageId) {
          id

          content {
            title
          }

          # NOTE: maxDepth = 3
          parent {
            id

            content {
              title
            }

            parent {
              id

              content {
                title
              }

              parent {
                id

                content {
                  title
                }
              }
            }
          }

          site {
            id
          }
        }
      }
    `),
  );

  // NOTE: maxDepth = 3
  $: breadcrumbs = [
    $query.page.parent?.parent?.parent,
    $query.page.parent?.parent,
    $query.page.parent,
    $query.page,
  ].filter(Boolean) as NonNullable<typeof $query.page>[];
</script>

<nav aria-label="Breadcrumb">
  <ol
    class={flex({
      paddingX: '12px',
      gap: '6px',
    })}
  >
    <li>
      <a href={`/${$query.page.site.id}`}>홈</a>
    </li>
    <li aria-hidden="true">&gt;</li>
    {#each breadcrumbs as page, i (page.id)}
      <li>
        <a aria-current={i === breadcrumbs.length - 1 ? 'page' : undefined} href={`/${$query.page.site.id}/${page.id}`}>
          {page.content.title}
        </a>
      </li>
      {#if i < breadcrumbs.length - 1}
        <li aria-hidden="true">&gt;</li>
      {/if}
    {/each}
  </ol>
</nav>
