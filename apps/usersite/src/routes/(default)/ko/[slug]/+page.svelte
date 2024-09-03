<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { TiptapRenderer } from '@readable/ui/tiptap';
  import { graphql } from '$graphql';
  import Breadcrumb from './Breadcrumb.svelte';

  $: query = graphql(`
    query PagePage_Query($slug: String!) {
      publicPage(slug: $slug) {
        id
        slug

        content {
          id
          title
          content
        }
      }

      ...PagePage_Breadcrumb_query
    }
  `);
</script>

<Breadcrumb _query={$query} />
<h1 class={css({ textStyle: '34eb' })}>{$query.publicPage.content.title}</h1>

<TiptapRenderer content={$query.publicPage.content.content} />
