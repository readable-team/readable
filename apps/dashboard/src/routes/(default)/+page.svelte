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

<div>FIXME: 팀 페이지</div>
