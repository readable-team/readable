<script lang="ts">
  import { Button, Helmet, TextInput } from '@readable/ui/components';
  import { goto } from '$app/navigation';
  import { graphql } from '$graphql';

  let siteName = '';

  $: query = graphql(`
    query WorkspacePage_Query($workspaceId: ID!) {
      workspace(workspaceId: $workspaceId) {
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
    mutation WorkspacePage_CreateSite_Mutation($input: CreateSiteInput!) {
      site: createSite(input: $input) {
        id
      }
    }
  `);
</script>

<Helmet title={$query.workspace.name} />

워크스페이스 메인 페이지

<br />
<br />

사이트 목록:
<br />

{#each $query.workspace.sites as site (site.id)}
  <a href={`/workspace/${$query.workspace.id}/site/${site.id}`}>{site.name}</a>
  <br />
{/each}

<br />
<br />
<TextInput name="email" placeholder="새 사이트 이름" bind:value={siteName} />
<br />
<Button
  on:click={async () => {
    const site = await createSite({ workspaceId: $query.workspace.id, name: siteName });
    await goto(`/workspace/${$query.workspace.id}/site/${site.id}`);
  }}
>
  새 사이트 만들기
</Button>
