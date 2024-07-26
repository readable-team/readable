<script lang="ts">
  import Tabs from '$lib/components/Tabs.svelte';

  export let data;
</script>

<h1>스타일 페이지</h1>
<Tabs
  tabs={[
    { title: '사이트 디자인 설정', path: `/workspace/${data.workspaceId}/site/${data.siteId}/designs` },
    {
      title: '시작 페이지 디자인 설정',
      path: `/workspace/${data.workspaceId}/site/${data.siteId}/designs/initialpage`,
    },
  ]}
/>

<br />
<br />

<slot />
