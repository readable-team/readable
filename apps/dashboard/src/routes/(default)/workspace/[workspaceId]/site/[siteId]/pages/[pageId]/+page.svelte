<script lang="ts">
  import { graphql } from '$graphql';
  import Editor from './Editor.svelte';

  $: query = graphql(`
    query PagePage_Query($pageId: ID!) {
      page(pageId: $pageId) {
        id
      }

      ...PagePage_Editor_query
    }
  `);
</script>

{#key $query.page.id}
  <Editor _query={$query} />
{/key}
