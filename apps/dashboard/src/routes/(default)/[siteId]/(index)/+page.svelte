<script lang="ts">
  import { graphql } from '$graphql';
  import LeftSideBar from '../LeftSideBar.svelte';

  $: query = graphql(`
    query SitePage_Query($siteId: ID!) {
      site(siteId: $siteId) {
        id
        hasPage
        ...LeftSideBar_site

        categories {
          id

          pages {
            id
          }
        }
      }
    }
  `);
</script>

<LeftSideBar $site={$query.site} />

{#if $query.site.categories.length === 0}
  카테고리를 추가해주세요
{:else if $query.site.hasPage}
  페이지를 선택해주세요
{:else}
  페이지를 추가해주세요
{/if}
