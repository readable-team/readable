<script lang="ts">
  import { trpc } from '$lib/trpc';

  export let data;
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
