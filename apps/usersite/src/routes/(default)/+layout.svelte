<script lang="ts">
  import { graphql } from '$graphql';

  $: query = graphql(`
    query DefaultLayout_Query($hostname: String!) {
      publicSite(hostname: $hostname) {
        id

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

<slot />
