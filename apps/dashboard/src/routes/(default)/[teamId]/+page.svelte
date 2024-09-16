<script lang="ts">
  import { flex } from '@readable/styled-system/patterns';
  import { page } from '$app/stores';
  import { graphql } from '$graphql';
  import { Tabs } from '$lib/components';

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

<nav
  class={flex({
    align: 'center',
    borderBottomWidth: '1px',
    borderColor: 'border.secondary',
    paddingX: '20px',
    height: '46px',
  })}
>
  <Tabs
    tabs={[
      {
        title: '사이트',
        path: `/${$query.team.id}`,
        selected: $page.url.pathname === `/${$query.team.id}`,
      },
      // ...($query.team.meAsMember?.role === 'ADMIN'
      //   ? [
      //       {
      //         title: '팀 설정',
      //         path: `/${$query.team.id}/settings`,
      //         selected: $page.url.pathname.startsWith(`/${$query.team.id}/settings`),
      //       },
      //     ]
      //   : []),
    ]}
  />
</nav>

{#each $query.team.sites as site (site.id)}
  <a href={`/${$query.team.id}/${site.id}`}>{site.name}</a>
{/each}
