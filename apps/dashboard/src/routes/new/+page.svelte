<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { goto } from '$app/navigation';
  import { graphql } from '$graphql';

  $: graphql(`
    query NewPage_Query {
      me {
        id

        workspaces {
          id
        }
      }
    }
  `);

  const createDefaultWorkspace = graphql(`
    mutation NewPage_CreateDefaultWorkspace_Mutation {
      createDefaultWorkspace {
        id
      }
    }
  `);

  const createSite = graphql(`
    mutation NewPage_CreateSite_Mutation($input: CreateSiteInput!) {
      createSite(input: $input) {
        id
      }
    }
  `);

  let name: string;
</script>

<h1 class={css({ fontSize: '20px', fontWeight: 'bold' })}>새 사이트 만들기</h1>

사이트 이름:
<input class={css({ borderWidth: '1px' })} type="text" bind:value={name} />

<br />

<button
  type="button"
  on:click={async () => {
    const workspace = await createDefaultWorkspace();
    const site = await createSite({ workspaceId: workspace.id, name });
    await goto(`/workspace/${workspace.id}/site/${site.id}`);
  }}
>
  만들기
</button>
