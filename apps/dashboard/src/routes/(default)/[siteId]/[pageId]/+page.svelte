<script lang="ts">
  import { flex } from '@readable/styled-system/patterns';
  import { Helmet } from '@readable/ui/components';
  import { graphql } from '$graphql';
  import Breadcrumb from './Breadcrumb.svelte';
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

      ...PagePage_Breadcrumb_query
      ...PagePage_PageMenuBar_query
      ...PagePage_Editor_query
    }
  `);
</script>

<Helmet title={$query.page.content.title} trailing={$query.page.site.name} />

{#key $query.page.id}
  <div
    class={flex({
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingX: '80px',
      backgroundColor: 'surface.tertiary',
      width: 'full',
      height: '58px',
    })}
  >
    <Breadcrumb _query={$query} />
    <PageMenuBar _query={$query} />
  </div>

  <Editor _query={$query} />
{/key}
