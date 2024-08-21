<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { graphql } from '$graphql';

  $: query = graphql(`
    query DefaultLayout_Query($hostname: String!) {
      publicSite(hostname: $hostname) {
        id
        url
        themeColor

        logo {
          id
          url
        }
      }
    }
  `);
</script>

<svelte:head>
  {#if $query.publicSite.logo}
    <link href={`${$query.publicSite.logo.url}?s=32&f=png`} rel="icon" sizes="32x32" type="image/png" />
  {/if}
</svelte:head>

<div style:--usersite-theme-color={$query.publicSite.themeColor} class={css({ display: 'contents' })}>
  <slot />
</div>
