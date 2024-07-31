<script lang="ts">
  import { graphql } from '$graphql';

  graphql(`
    query DefaultLayout_Query {
      me {
        id

        workspaces {
          id
        }
      }
    }
  `);
</script>

<slot />
