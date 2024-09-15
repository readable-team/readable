<script lang="ts">
  import mixpanel from 'mixpanel-browser';
  import { browser } from '$app/environment';
  import { graphql } from '$graphql';

  $: query = graphql(`
    query TeamLayout_Query($teamId: ID!) {
      team(teamId: $teamId) {
        id
      }
    }
  `);

  $: if (browser) {
    mixpanel.register({
      team_id: $query.team.id,
    });
  }
</script>

<slot />
