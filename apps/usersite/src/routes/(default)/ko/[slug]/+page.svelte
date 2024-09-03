<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { TiptapRenderer } from '@readable/ui/tiptap';
  import { graphql } from '$graphql';
  import Breadcrumb from './Breadcrumb.svelte';
  import Toc from './Toc.svelte';

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

  let headings: { level: number; text: string; scrollTop: number }[] = [];
</script>

<div
  class={css({
    flex: '1',
    maxWidth: '820px',
    paddingX: '50px',
    paddingTop: '20px',
    paddingBottom: '120px',
  })}
>
  <Breadcrumb _query={$query} />
  <h1 class={css({ textStyle: '34eb' })}>{$query.publicPage.content.title}</h1>

  <TiptapRenderer content={$query.publicPage.content.content} on:tocUpdate={(e) => (headings = e.detail.headings)} />
</div>

<Toc {headings} />
