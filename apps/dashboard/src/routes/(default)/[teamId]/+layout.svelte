<script lang="ts">
  import { flex } from '@readable/styled-system/patterns';
  import mixpanel from 'mixpanel-browser';
  import { onMount } from 'svelte';
  import { graphql } from '$graphql';
  import Header from './@header/Header.svelte';

  $: query = graphql(`
    query TeamLayout_Query($teamId: ID!) {
      ...Header_query

      team(teamId: $teamId) {
        id
      }
    }
  `);

  const teamUpdateStream = graphql(`
    subscription TeamLayout_TeamUpdateStream_Subscription($teamId: ID!) {
      teamUpdateStream(teamId: $teamId) {
        ... on Team {
          id
          name
          ...SiteSwitcher_team
          ...UserSettingModal_team
        }

        ... on TeamMember {
          id
        }
      }
    }
  `);

  onMount(() => {
    mixpanel.register({
      team_id: $query.team.id,
    });

    const unsubscribe = teamUpdateStream.subscribe({
      teamId: $query.team.id,
    });

    return () => {
      mixpanel.unregister('team_id');

      unsubscribe();
    };
  });
</script>

<div class={flex({ flexDirection: 'column', height: 'screen' })}>
  <Header {$query} />

  <slot />
</div>
