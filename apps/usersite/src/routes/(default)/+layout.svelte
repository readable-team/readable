<script lang="ts">
  import { graphql } from '$graphql';

  $: graphql(`
    query DefaultLayout_Query($hostname: String!) {
      publicSite(hostname: $hostname) {
        id
      }
    }
  `);
</script>

<slot />
