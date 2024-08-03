<script lang="ts">
  import { Helmet } from '@readable/ui/components';
  import { browser } from '$app/environment';
  import { graphql } from '$graphql';
  import { buildPageFullSlug } from '$lib/utils/url';
  import Editor from './Editor.svelte';

  $: query = graphql(`
    query PagePage_Query($slug: String!) {
      page(slug: $slug) {
        id
        slug

        content {
          id
          title
        }

        site {
          id
          name
          slug
        }
      }

      ...PagePage_Editor_query
    }
  `);

  $: if (browser) {
    history.replaceState(null, '', `/${$query.page.site.slug}/${buildPageFullSlug($query.page)}`);
  }
</script>

<Helmet title={$query.page.content.title} trailing={$query.page.site.name} />

{#key $query.page.id}
  <Editor _query={$query} />
{/key}
