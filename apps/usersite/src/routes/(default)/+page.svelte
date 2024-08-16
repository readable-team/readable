<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { graphql } from '$graphql';
  import { pageUrl } from '$lib/utils/url';

  $: query = graphql(`
    query IndexPage_Query($hostname: String!) {
      publicSite(hostname: $hostname) {
        id
        name

        logo {
          id
          url
        }

        # NOTE: maxDepth = 2
        sections {
          id
          name
          order

          pages {
            id
            state
            order
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
              state
              order
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
  `);
</script>

usersite
<br />
{#if $query.publicSite.logo}
  <img class={css({ size: '32px' })} alt="Logo" src={$query.publicSite.logo.url} />
{/if}
id: {$query.publicSite.id}
<br />
name: {$query.publicSite.name}
<br />
pages:
<ul>
  {#each $query.publicSite.sections as section (section.id)}
    <li>{section.name}</li>
    {#if section.pages}
      <ul>
        {#each section.pages as child (child.id)}
          <li style="margin-left: 1rem;">
            <a href={pageUrl(child)}>{child.content.title}</a>
          </li>
          {#if child.children}
            <ul>
              {#each child.children as grandchild (grandchild.id)}
                <li style="margin-left: 1rem;">
                  <a href={pageUrl(grandchild)}>{grandchild.content.title}</a>
                </li>
              {/each}
            </ul>
          {/if}
        {/each}
      </ul>
    {/if}
  {/each}
</ul>
