<script lang="ts">
  import Tabs from '$lib/components/Tabs.svelte';

  export let data;
</script>

<h1>디자인 페이지</h1>
<Tabs
  tabs={[
    { title: '디자인 설정', path: `/workspace/${data.workspaceId}/site/${data.siteId}/design` },
    { title: '메인 페이지 설정', path: `/workspace/${data.workspaceId}/site/${data.siteId}/design/home` },
  ]}
/>

<br />
<br />

<slot />
