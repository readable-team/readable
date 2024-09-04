<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Icon } from '@readable/ui/components';
  import ChevronDownIcon from '~icons/lucide/chevron-down';
  import ChevronRightIcon from '~icons/lucide/chevron-right';
  import { page } from '$app/stores';
  import { fragment, graphql } from '$graphql';
  import type { Navigation_publicSite } from '$graphql';

  let _publicSite: Navigation_publicSite;
  export { _publicSite as $publicSite };

  $: publicSite = fragment(
    _publicSite,
    graphql(`
      fragment Navigation_publicSite on PublicSite {
        # NOTE: maxDepth = 2
        categories {
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
    `),
  );

  let treeOpenState: Record<string, boolean> = {};
  $: currentSlug = $page.params.slug.split('-', 2)[0];
</script>

<nav class={flex({ direction: 'column', gap: '24px' })}>
  {#each $publicSite.categories as category (category.id)}
    <div>
      <h2
        class={css({
          color: 'text.secondary',
          textStyle: '14b',
          paddingX: '12px',
          paddingY: '5px',
          borderRadius: '4px',
        })}
      >
        {category.name}
      </h2>
      <ul class={flex({ direction: 'column', listStyle: 'none' })}>
        {#each category.pages.filter((p) => !p.parent) as p (p.id)}
          <li
            class={flex({
              position: 'relative',
              alignItems: 'center',
              textStyle: '15m',
              color: 'text.secondary',
            })}
            aria-current={p.slug === currentSlug ? 'page' : undefined}
          >
            <a
              class={css({
                paddingX: '12px',
                paddingY: '8px',
                borderRadius: '6px',
                paddingRight: '36px',
                flex: '1',
                _hover: {
                  backgroundColor: 'var(--usersite-theme-color)/4',
                },
                _currentPage: {
                  'color': 'var(--usersite-theme-color)',
                  'textStyle': '15b',
                  'backgroundColor': 'var(--usersite-theme-color)/4',
                  '& + button': {
                    color: 'var(--usersite-theme-color)/46',
                  },
                },
              })}
              aria-current={p.slug === currentSlug ? 'page' : undefined}
              href={`/ko/${p.slug}`}
              on:click={() => {
                treeOpenState[p.id] = true;
              }}
            >
              {p.content.title}
            </a>
            {#if p.children.length > 0}
              <button
                class={css({
                  position: 'absolute',
                  right: '8px',
                  top: '8px',
                  width: '22px',
                  height: '22px',
                  padding: '3px',
                  borderRadius: '2px',
                  color: 'neutral.70',
                  _hover: {
                    backgroundColor: 'var(--usersite-theme-color)/24',
                    color: 'var(--usersite-theme-color)/46',
                  },
                })}
                aria-expanded={treeOpenState[p.id] ? 'true' : 'false'}
                type="button"
                on:click={() => {
                  treeOpenState[p.id] = !treeOpenState[p.id];
                }}
              >
                <Icon icon={treeOpenState[p.id] ? ChevronDownIcon : ChevronRightIcon} size={16} />
              </button>
            {/if}
          </li>
          {#if p.children.length > 0 && treeOpenState[p.id]}
            <ul class={flex({ direction: 'column', listStyle: 'none', paddingLeft: '14px' })}>
              {#each p.children as childPage (childPage.id)}
                <li class={css({ display: 'contents' })}>
                  <a
                    class={css({
                      paddingX: '12px',
                      paddingY: '8px',
                      borderLeftWidth: '1px',
                      borderLeftColor: 'neutral.30',
                      textStyle: '15m',
                      color: 'text.secondary',
                      _hover: {
                        backgroundColor: 'var(--usersite-theme-color)/4',
                      },
                      _currentPage: {
                        borderLeftColor: 'var(--usersite-theme-color)',
                        color: 'var(--usersite-theme-color)',
                        textStyle: '15b',
                        backgroundColor: 'var(--usersite-theme-color)/4',
                      },
                    })}
                    aria-current={childPage.slug === currentSlug ? 'page' : undefined}
                    href={`/ko/${childPage.slug}`}
                  >
                    {childPage.content.title}
                  </a>
                </li>
              {/each}
            </ul>
          {/if}
        {/each}
      </ul>
    </div>
  {/each}
</nav>
