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
        publicPage(slug: $slug) {
          id

          category {
            id
            name
          }

          parent {
            id
            slug

            content {
              id
              title
            }
          }
        }
      }
    `),
  );
</script>

<nav class={css({ truncate: true, marginBottom: '24px' })} aria-label="Breadcrumb">
  <ol
    class={flex({
      'align': 'center',
      'gap': '6px',
      'truncate': true,
      '& > li': {
        textStyle: '14m',
        color: 'text.secondary',
      },
      '& > li > span': {
        display: 'block',
        truncate: true,
      },
      '& > li > a': {
        display: 'block',
        truncate: true,
        _hover: { color: 'var(--usersite-theme-color)' },
      },
    })}
  >
    <li class={css({ truncate: true })}>
      <span>{$query.publicPage.category.name}</span>
    </li>
    {#if $query.publicPage.parent}
      <li aria-hidden="true">/</li>
      <li class={css({ truncate: true })}>
        <a href={`/ko/${$query.publicPage.parent.slug}`}>
          {$query.publicPage.parent.content.title}
        </a>
      </li>
    {/if}
  </ol>
</nav>
