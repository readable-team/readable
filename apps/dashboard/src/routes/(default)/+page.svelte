<script lang="ts">
  import { Button, Helmet, TextInput } from '@readable/ui/components';
  import { goto } from '$app/navigation';
  import { graphql } from '$graphql';

  let siteName = '';

  $: query = graphql(`
    query TeamPage_Query($teamId: ID!) {
      team(teamId: $teamId) {
        id
        name

        sites {
          id
          name
        }
      }
    }
  `);

  const createSite = graphql(`
    mutation TeamPage_CreateSite_Mutation($input: CreateSiteInput!) {
      createSite(input: $input) {
        id
      }
    }
  `);

  const deleteTeam = graphql(`
    mutation TeamPage_DeleteTeam_Mutation($input: DeleteTeamInput!) {
      deleteTeam(input: $input) {
        id
      }
    }
  `);
</script>

<Helmet title={$query.team.name} />

팀 메인 페이지

<br />
팀 이름: {$query.team.name}
<br />
<Button
  on:click={async () => {
    await deleteTeam({ teamId: $query.team.id });
    await goto('/', { invalidateAll: true });
  }}
>
  팀 삭제
</Button>
<br />
<br />

사이트 목록:
<br />

{#each $query.team.sites as site (site.id)}
  <a href={`/${site.id}`}>{site.name}</a>
  <br />
{/each}

<br />
<br />
<TextInput name="email" placeholder="새 사이트 이름" bind:value={siteName} />
<br />
<Button
  on:click={async () => {
    const site = await createSite({ teamId: $query.team.id, name: siteName });
    await goto(`/${site.id}`);
  }}
>
  새 사이트 만들기
</Button>
