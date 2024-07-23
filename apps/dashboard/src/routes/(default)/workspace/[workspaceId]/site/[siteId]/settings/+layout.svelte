<script lang="ts">
  export let data;
</script>

<h1>설정 페이지</h1>

탭:
<a href={`/workspace/${data.workspaceId}/site/${data.siteId}/settings`}>일반</a>
<a href={`/workspace/${data.workspaceId}/site/${data.siteId}/settings/seo`}>SEO</a>

<br />
<br />

<slot />
