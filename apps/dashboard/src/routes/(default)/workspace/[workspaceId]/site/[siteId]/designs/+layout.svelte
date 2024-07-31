<script lang="ts">
  import { page } from '$app/stores';
  import Tabs from '$lib/components/Tabs.svelte';
</script>

<h1>스타일 페이지</h1>
<Tabs
  tabs={[
    { title: '사이트 디자인 설정', path: `/workspace/${$page.params.workspaceId}/site/${$page.params.siteId}/designs` },
    {
      title: '시작 페이지 디자인 설정',
      path: `/workspace/${$page.params.workspaceId}/site/${$page.params.siteId}/designs/initialpage`,
    },
  ]}
/>

<br />
<br />

<slot />
