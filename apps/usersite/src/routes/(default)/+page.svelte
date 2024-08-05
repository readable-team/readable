<script lang="ts">
  import { graphql } from '$graphql';
  import { pageUrl } from '$lib/utils/url';

  $: query = graphql(`
    query IndexPage_Query($hostname: String!) {
      publicSite(hostname: $hostname) {
        id
        name

        # NOTE: maxDepth = 3
        pages {
          id
          slug

          content {
            id
            title
          }

          parent {
            id
          }

          children {
            id
            slug

            content {
              id
              title
            }

            parent {
              id
            }

            children {
              id
              slug

              content {
                id
                title
              }

              parent {
                id
              }

              children {
                id
                slug

                content {
                  id
                  title
                }

                parent {
                  id
                }
              }
            }
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
    {#if page.children}
      <ul>
        {#each page.children as child (child.id)}
          <li style="margin-left: 1rem;">
            <a href={pageUrl(child)}>{child.content.title}</a>
          </li>
          {#if child.children}
            <ul>
              {#each child.children as grandchild (grandchild.id)}
                <li style="margin-left: 1rem;">
                  <a href={pageUrl(grandchild)}>{grandchild.content.title}</a>
                </li>
                {#if grandchild.children}
                  <ul>
                    {#each grandchild.children as greatgrandchild (greatgrandchild.id)}
                      <li style="margin-left: 1rem;">
                        <a href={pageUrl(greatgrandchild)}>{greatgrandchild.content.title}</a>
                      </li>
                    {/each}
                  </ul>
                {/if}
              {/each}
            </ul>
          {/if}
        {/each}
      </ul>
    {/if}
  {/each}
</ul>
