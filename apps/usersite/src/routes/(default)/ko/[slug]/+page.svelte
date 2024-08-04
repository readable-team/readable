<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { TiptapRenderer } from '@readable/ui/tiptap';
  import { graphql } from '$graphql';

  $: query = graphql(`
    query PagePage_Query($slug: String!) {
      publicPage(slug: $slug) {
        id
        slug

        content {
          id
          title
          subtitle
          content
        }
      }
    }
  `);
</script>

<h1 class={css({ textStyle: '24b' })}>{$query.publicPage.content.title}</h1>
{#if $query.publicPage.content.subtitle}
  <h2 class={css({ textStyle: '18b' })}>{$query.publicPage.content.subtitle}</h2>
{/if}

<TiptapRenderer content={$query.publicPage.content.content} />
