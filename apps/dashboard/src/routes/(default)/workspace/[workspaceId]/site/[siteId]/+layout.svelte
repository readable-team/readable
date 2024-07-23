<script lang="ts">
  export let data;
</script>

사이드바:
<a href={`/workspace/${data.workspaceId}/site/${data.siteId}/pages`}>페이지</a>
<a href={`/workspace/${data.workspaceId}/site/${data.siteId}/design`}>디자인</a>
<a href={`/workspace/${data.workspaceId}/site/${data.siteId}/settings`}>설정</a>
<br />
<br />

<slot />
