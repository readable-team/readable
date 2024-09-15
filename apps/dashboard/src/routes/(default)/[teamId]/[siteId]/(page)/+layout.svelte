<script lang="ts">
  import { graphql } from '$graphql';
  import LeftSideBar from '../LeftSideBar.svelte';

  $: query = graphql(`
    query SitePageLayout_Query($siteId: ID!) {
      site(siteId: $siteId) {
        id
        ...LeftSideBar_site
      }
    }
  `);
</script>

<LeftSideBar $site={$query.site} />

<slot />
