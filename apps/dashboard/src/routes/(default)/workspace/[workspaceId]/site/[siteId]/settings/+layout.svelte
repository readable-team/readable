<script lang="ts">
  import Tabs from '$lib/components/Tabs.svelte';

  export let data;
</script>

<h1>설정 페이지</h1>

<Tabs
  tabs={[
    { title: '일반', path: `/workspace/${data.workspaceId}/site/${data.siteId}/settings` },
    { title: 'SEO', path: `/workspace/${data.workspaceId}/site/${data.siteId}/settings/seo` },
  ]}
/>

<br />
<br />

<slot />
