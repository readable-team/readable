<script lang="ts">
  import { Helmet } from '@readable/ui/components';
  import { graphql } from '$graphql';
  import Editor from './Editor.svelte';

  $: query = graphql(`
    query PagePage_Query($pageId: ID!) {
      page(pageId: $pageId) {
        id

        content {
          id
          title
        }

        site {
          id
          name
        }
      }

      ...PagePage_Editor_query
    }
  `);
</script>

<Helmet title={$query.page.content.title} trailing={$query.page.site.name} />

{#key $query.page.id}
  <Editor _query={$query} />
{/key}
