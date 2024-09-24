<script lang="ts">
  import { graphql } from '$graphql';

  $: graphql(`
    query GoPage_Query($pageId: ID!) {
      publicPageById(pageId: $pageId) {
        id
        ...PageUrl_publicPage
      }
    }
  `);
</script>
