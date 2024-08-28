<script lang="ts">
  import { graphql } from '$graphql';

  $: query = graphql(`
    query SitePage_Query($siteId: ID!) {
      site(siteId: $siteId) {
        id
        hasPage

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

{#if $query.site.categories.length === 0}
  카테고리를 추가해주세요
{:else if $query.site.hasPage}
  페이지를 선택해주세요
{:else}
  페이지를 추가해주세요
{/if}
