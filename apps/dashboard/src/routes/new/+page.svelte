<script lang="ts">
  import { goto } from '$app/navigation';
  import { trpc } from '$lib/trpc';
  import { css } from '$styled-system/css';

  let name: string;
</script>

<h1 class={css({ fontSize: '20px', fontWeight: 'bold' })}>새 사이트 만들기</h1>

사이트 이름:
<input class={css({ borderWidth: '1px' })} type="text" bind:value={name} />

<br />

<button
  type="button"
  on:click={async () => {
    const workspace = await trpc.workspace.createDefault.mutate();
    const site = await trpc.site.create.mutate({ workspaceId: workspace.id, name });
    await goto(`/workspace/${workspace.id}/site/${site.id}/dashboard`);
  }}
>
  만들기
</button>
