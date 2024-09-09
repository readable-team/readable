<script lang="ts">
  import { css } from '@readable/styled-system/css';
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

<nav class={css({})} aria-label="Breadcrumb">
  <ol
    class={css({
      '& > li': {
        display: 'inline-block',
        color: 'text.secondary',
        textStyle: '15r',
      },
      '& > li > a': {
        _hover: { color: 'var(--usersite-theme-color)' },
      },
    })}
  >
    <li>
      <span>{$query.publicPage.category.name}</span>
      <span class={css({ color: 'neutral.50' })} aria-hidden="true">/</span>
    </li>
    {#if $query.publicPage.parent}
      <li>
        <a href={`/ko/${$query.publicPage.parent.slug}`}>
          {$query.publicPage.parent.content.title}
        </a>
        <span class={css({ color: 'neutral.50' })} aria-hidden="true">/</span>
      </li>
    {/if}
    <li>
      <a aria-current="page" href={`/ko/${$query.publicPage.slug}`}>
        {$query.publicPage.content.title}
      </a>
    </li>
  </ol>
</nav>
