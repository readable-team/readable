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
          slug

          content {
            id
            title
          }

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

<nav class={css({ truncate: true })} aria-label="Breadcrumb">
  <ol
    class={flex({
      'align': 'center',
      'gap': '6px',
      'truncate': true,
      '& > li': {
        textStyle: '15r',
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
    <li class={css({ color: 'text.secondary', truncate: true })}>
      <span>{$query.publicPage.category.name}</span>
    </li>
    {#if $query.publicPage.parent}
      <li class={css({ color: 'neutral.50' })} aria-hidden="true">/</li>
      <li class={css({ color: 'text.secondary', truncate: true })}>
        <a href={`/ko/${$query.publicPage.parent.slug}`}>
          {$query.publicPage.parent.content.title}
        </a>
      </li>
    {/if}
    <li class={css({ color: 'neutral.50' })} aria-hidden="true">/</li>
    <li class={css({ color: 'text.secondary', truncate: true })}>
      <a aria-current="page" href={`/ko/${$query.publicPage.slug}`}>
        {$query.publicPage.content.title}
      </a>
    </li>
  </ol>
</nav>
