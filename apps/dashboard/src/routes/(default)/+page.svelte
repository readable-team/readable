<script lang="ts">
  import { graphql } from '$graphql';

  $: graphql(`
    query IndexPage_Query {
      me {
        id

        teams {
          id
        }
      }
    }
  `);
</script>
