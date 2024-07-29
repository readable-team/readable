<script lang="ts">
  import { Button, TextInput } from '@readable/ui/components';
  import { goto } from '$app/navigation';
  import { trpc } from '$lib/trpc';

  export let data;

  let siteName = '';
  let inviteMemberEmail = '';
</script>

워크스페이스 메인 페이지

<br />
<br />

사이트 목록:
<br />

{#await trpc.site.list.query({ workspaceId: data.workspaceId }) then sites}
  {#each sites as site (site.id)}
    <a href={`/workspace/${data.workspaceId}/site/${site.id}`}>{site.name}</a>
    <br />
  {/each}
{/await}

{#await trpc.workspace.hasAny.query() then hasAny}
  {#if hasAny}
    <br />
    <br />
    <TextInput name="email" placeholder="새 사이트 이름" bind:value={siteName} />
    <br />
    <Button
      on:click={async () => {
        const site = await trpc.site.create.mutate({ workspaceId: data.workspaceId, name: siteName });
        await goto(`/workspace/${data.workspaceId}/site/${site.id}`);
      }}
    >
      새 사이트 만들기
    </Button>
  {/if}
{/await}

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
    await trpc.workspace.inviteMember.query({
      workspaceId: data.workspaceId,
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

{#await trpc.workspace.listMembers.query({ workspaceId: data.workspaceId }) then members}
  <ul>
    {#each members as member (member.id)}
      <li>
        <p>email: {member.email}</p>
        <p>role: {member.role}</p>
      </li>
    {/each}
  </ul>
{/await}
