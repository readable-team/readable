<script lang="ts">
  import { graphql } from '$graphql';
  import { pageUrl } from '$lib/utils/url';

  $: query = graphql(`
    query IndexPage_Query($hostname: String!) {
      publicSite(hostname: $hostname) {
        id
        name

        pages {
          id
          slug

          content {
            id
            title
          }
        }
      }
    }
  `);
</script>

usersite
<br />
id: {$query.publicSite.id}
<br />
name: {$query.publicSite.name}
<br />
pages:
<ul>
  {#each $query.publicSite.pages as page (page.id)}
    <li><a href={pageUrl(page)}>{page.content.title}</a></li>
  {/each}
</ul>
