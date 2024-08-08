<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Icon } from '@readable/ui/components';
  import ChevronRightIcon from '~icons/lucide/chevron-right';
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

<nav class={css({ truncate: true })} aria-label="Breadcrumb">
  <ol
    class={flex({
      'align': 'center',
      'gap': '4px',
      'truncate': true,
      '& > li': {
        display: 'inline-block',
        borderRadius: '6px',
        textStyle: '15m',
        color: 'text.tertiary',
      },
      '& > li > a': {
        paddingX: '8px',
        paddingY: '4px',
      },
    })}
  >
    <li class={css({ _hover: { backgroundColor: 'surface.secondary' } })}>
      <a href={`/${$query.page.site.id}`}>홈</a>
    </li>
    <li aria-hidden="true">
      <Icon icon={ChevronRightIcon} />
    </li>
    {#each breadcrumbs as page, i (page.id)}
      {@const current = i === breadcrumbs.length - 1}
      <li
        class={css({
          truncate: true,
          _hover: { backgroundColor: 'surface.secondary' },
        })}
      >
        <a
          class={css(current && { textStyle: '15sb', color: 'text.primary' })}
          aria-current={current ? 'page' : undefined}
          href={`/${$query.page.site.id}/${page.id}`}
        >
          {page.content.title}
        </a>
      </li>
      {#if i < breadcrumbs.length - 1}
        <li aria-hidden="true">
          <Icon icon={ChevronRightIcon} />
        </li>
      {/if}
    {/each}
  </ol>
</nav>
