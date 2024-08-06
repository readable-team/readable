<script lang="ts">
  import { Helmet } from '@readable/ui/components';
  import { graphql } from '$graphql';
  import Editor from './Editor.svelte';
  import PageMenuBar from './PageMenuBar.svelte';

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

      ...PagePage_PageMenuBar_query
      ...PagePage_Editor_query
    }
  `);
</script>

<Helmet title={$query.page.content.title} trailing={$query.page.site.name} />

{#key $query.page.id}
  <PageMenuBar _query={$query} />
  <Editor _query={$query} />
{/key}
