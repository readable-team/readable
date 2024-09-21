<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { fragment, graphql } from '$graphql';
  import type { PagePage_Breadcrumb_publicPage } from '$graphql';

  export let _publicPage: PagePage_Breadcrumb_publicPage;

  $: publicPage = fragment(
    _publicPage,
    graphql(`
      fragment PagePage_Breadcrumb_publicPage on PublicPage {
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
    `),
  );
</script>

<nav aria-label="Breadcrumb">
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
      <span>{$publicPage.category.name}</span>
      <span class={css({ color: 'neutral.50' })} aria-hidden="true">/</span>
    </li>
    {#if $publicPage.parent}
      <li>
        <a href={`/ko/${$publicPage.parent.slug}`}>
          {$publicPage.parent.content.title}
        </a>
        <span class={css({ color: 'neutral.50' })} aria-hidden="true">/</span>
      </li>
    {/if}
    <li>
      <a aria-current="page" href={`/ko/${$publicPage.slug}`}>
        {$publicPage.content.title}
      </a>
    </li>
  </ol>
</nav>
