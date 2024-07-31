<script lang="ts">
  import { page } from '$app/stores';
  import Tabs from '$lib/components/Tabs.svelte';
</script>

<h1>설정 페이지</h1>

<Tabs
  tabs={[
    { title: '일반', path: `/workspace/${$page.params.workspaceId}/site/${$page.params.siteId}/settings` },
    { title: '디자인', path: `/workspace/${$page.params.workspaceId}/site/${$page.params.siteId}/settings/designs` },
    { title: 'SEO', path: `/workspace/${$page.params.workspaceId}/site/${$page.params.siteId}/settings/seo` },
  ]}
/>

<br />
<br />

<slot />
