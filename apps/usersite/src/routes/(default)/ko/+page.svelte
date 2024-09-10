<script lang="ts">
  import { graphql } from '$graphql';

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  $: query = graphql(`
    query KoIndexPage_Query {
      publicSite {
        id

        firstPage {
          id
          slug
        }
      }
    }
  `);
</script>
