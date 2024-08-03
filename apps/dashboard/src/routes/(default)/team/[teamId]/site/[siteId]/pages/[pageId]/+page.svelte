<script lang="ts">
  import { Helmet } from '@readable/ui/components';
  import { graphql } from '$graphql';
  import Editor from './Editor.svelte';

  $: query = graphql(`
    query PagePage_Query($teamId: ID!, $siteId: ID!, $pageId: ID!) {
      site(siteId: $siteId) {
        id
        name
      }

      page(pageId: $pageId) {
        id

        content {
          id
          title
        }
      }

      ...PagePage_Editor_query
    }
  `);
</script>

<Helmet title={$query.page.content.title} trailing={$query.site.name} />

{#key $query.page.id}
  <Editor _query={$query} />
{/key}
