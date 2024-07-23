<script lang="ts">
  export let data;
</script>

<h1>디자인 페이지</h1>

탭:
<a href={`/workspace/${data.workspaceId}/site/${data.siteId}/design`}>디자인 설정</a>
<a href={`/workspace/${data.workspaceId}/site/${data.siteId}/design/home`}>메인 페이지 설정</a>

<br />
<br />

<slot />
