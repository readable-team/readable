<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { Alert, Button, Helmet, TextInput } from '@readable/ui/components';
  import { goto } from '$app/navigation';
  import { graphql } from '$graphql';
  import { Img } from '$lib/components';

  let siteName = '';
  let deleteTeamOpen = false;

  $: query = graphql(`
    query TeamPage_Query($teamId: ID!) {
      team(teamId: $teamId) {
        id
        name
        avatar {
          id
          ...Img_image
        }

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
<Img
  style={css.raw({ borderWidth: '1px', borderColor: 'border.image', borderRadius: 'full', size: '38px' })}
  $image={$query.team.avatar}
  alt={`${$query.team.name}의 아바타`}
  size={48}
/>
<br />
<Button on:click={() => (deleteTeamOpen = true)}>팀 삭제</Button>
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

<Alert
  onAction={async () => {
    await deleteTeam({ teamId: $query.team.id });
    await goto('/', { invalidateAll: true });
  }}
  bind:open={deleteTeamOpen}
>
  <svelte:fragment slot="title">팀을 삭제할까요?</svelte:fragment>
  <svelte:fragment slot="content">팀을 삭제하면 팀에 속한 모든 사이트가 삭제돼요</svelte:fragment>

  <svelte:fragment slot="action">삭제하기</svelte:fragment>
  <svelte:fragment slot="cancel">삭제하지 않을래요</svelte:fragment>
</Alert>
