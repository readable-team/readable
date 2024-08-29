<script lang="ts">
  import { graphql } from '$graphql';

  $: graphql(`
    query TeamPage_Query($teamId: ID!) {
      team(teamId: $teamId) {
        id

        sites {
          id
          name
        }
      }
    }
  `);
</script>
