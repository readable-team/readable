<script lang="ts">
  import { graphql } from '$graphql';

  graphql(`
    query DefaultLayout_Query {
      me {
        id

        teams {
          id
        }
      }
    }
  `);
</script>

<slot />
