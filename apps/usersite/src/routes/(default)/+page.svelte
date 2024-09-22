<script lang="ts">
  import { graphql } from '$graphql';

  $: graphql(`
    query IndexPage_Query {
      publicSite {
        id

        firstPage {
          id
          ...PageUrl_publicPage
        }
      }
    }
  `);
</script>
