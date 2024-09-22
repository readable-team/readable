<script lang="ts">
  import { graphql } from '$graphql';

  graphql(`
    fragment PageUrl_publicPage on PublicPage {
      id
      slug

      parent {
        id
        slug
      }

      category {
        id
        slug
      }
    }
  `);
</script>
