<script lang="ts">
  import { Button, TextInput } from '@readable/ui/components';
  import { goto } from '$app/navigation';
  import { graphql } from '$graphql';

  let siteName = '';
  let inviteMemberEmail = '';

  $: query = graphql(`
    query WorkspacePage_Query($workspaceId: ID!) {
      workspace(workspaceId: $workspaceId) {
        id

        sites {
          id
          name
        }

        members {
          id
          role

          user {
            id
            email
          }
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

  const inviteWorkspaceMember = graphql(`
    mutation WorkspacePage_InviteWorkspaceMember_Mutation($input: InviteWorkspaceMemberInput!) {
      inviteWorkspaceMember(input: $input) {
        id
      }
    }
  `);
</script>

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

<br />
<br />

<hr />

<br />
<br />

<h2>워크스페이스에 새 멤버 초대</h2>

<TextInput name="email" placeholder="초대할 이메일" bind:value={inviteMemberEmail} />

<br />

<Button
  on:click={async () => {
    await inviteWorkspaceMember({
      workspaceId: $query.workspace.id,
      email: inviteMemberEmail,
    });
  }}
>
  워크스페이스 멤버 초대
</Button>

<br />
<br />

<hr />

<br />
<br />

<h2>워크스페이스 멤버 목록</h2>

<ul>
  {#each $query.workspace.members as member (member.id)}
    <li>
      <p>email: {member.user.email}</p>
      <p>role: {member.role}</p>
    </li>
  {/each}
</ul>
