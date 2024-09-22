<script context="module" lang="ts">
  import { graphql } from '$graphql';

  export const sitemapQuery = graphql(`
    query Sitemap_Query @manual {
      publicSite {
        id

        pages {
          id
          ...PageUrl_publicPage
        }
      }
    }
  `);
</script>
