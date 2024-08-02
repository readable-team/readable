<script lang="ts">
  import { graphql } from '$graphql';

  $: query = graphql(`
    query IndexPage_Query($hostname: String!) {
      publicSite(hostname: $hostname) {
        id
        name
      }
    }
  `);
</script>

usersite
<br />
id: {$query.publicSite.id}
<br />
name: {$query.publicSite.name}
