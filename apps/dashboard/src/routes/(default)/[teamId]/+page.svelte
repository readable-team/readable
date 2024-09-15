<script lang="ts">
  import { graphql } from '$graphql';

  $: query = graphql(`
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

{#each $query.team.sites as site (site.id)}
  <a href={`/${$query.team.id}/${site.id}`}>{site.name}</a>
{/each}
