<script lang="ts">
  import { css } from '@readable/styled-system/css';
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

          category {
            id
            name
          }

          content {
            id
            title
          }

          # NOTE: maxDepth = 2
          parent {
            id

            content {
              id
              title
            }

            parent {
              id

              content {
                id
                title
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

  // NOTE: maxDepth = 2
  $: breadcrumbs = [$query.page.parent?.parent, $query.page.parent, $query.page].filter(Boolean) as NonNullable<
    typeof $query.page
  >[];
</script>

<nav class={css({ truncate: true })} aria-label="Breadcrumb">
  <ol
    class={flex({
      'align': 'center',
      'gap': '6px',
      'truncate': true,
      '& > li': {
        textStyle: '14m',
        color: 'text.tertiary',
      },
      '& > li > a': {
        display: 'block',
        borderRadius: '4px',
        truncate: true,
        _hover: { color: 'var(--usersite-theme-color)' },
      },
    })}
  >
    <li class={css({ truncate: true })}>
      <span>{$query.page.category.name}</span>
    </li>
    {#each breadcrumbs as page, i (page.id)}
      <li aria-hidden="true">/</li>
      {@const current = i === breadcrumbs.length - 1}
      <li class={css({ truncate: true })}>
        <a
          class={css(current && { color: 'text.primary' })}
          aria-current={current ? 'page' : undefined}
          href={`/${$query.page.site.id}/${page.id}`}
        >
          {page.content.title}
        </a>
      </li>
    {/each}
  </ol>
</nav>
