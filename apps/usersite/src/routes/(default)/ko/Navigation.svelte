<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Icon } from '@readable/ui/components';
  import ChevronDownIcon from '~icons/lucide/chevron-down';
  import ChevronRightIcon from '~icons/lucide/chevron-right';
  import { page } from '$app/stores';
  import { fragment, graphql } from '$graphql';
  import { mobileNavOpen, treeOpenState } from '$lib/stores/ui';
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
              slug
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
                slug
              }
            }
          }
        }
      }
    `),
  );

  $: currentSlug = $page.params.slug.split('-', 2)[0];

  $: if (currentSlug) {
    $treeOpenState[currentSlug] = true;
  }

  function findPage(slug: string) {
    return [
      ...$publicSite.categories.flatMap((c) => c.pages),
      ...$publicSite.categories.flatMap((c) => c.pages.flatMap((p) => p.children)),
    ].find((p) => p.slug === slug);
  }

  $: if ($mobileNavOpen && currentSlug) {
    $treeOpenState = {};
    const p = findPage(currentSlug);
    if (p) {
      $treeOpenState[p.slug] = true;
      if (p.parent) {
        $treeOpenState[p.parent.slug] = true;
      }
    }
  }
</script>

<nav class={flex({ direction: 'column', gap: '40px' })}>
  {#each $publicSite.categories as category (category.id)}
    <div>
      <h2
        class={css({
          color: 'text.primary',
          textStyle: '15b',
          paddingX: '12px',
          paddingY: '5px',
          borderRadius: '4px',
        })}
      >
        {category.name}
      </h2>
      <ul class={flex({ direction: 'column', listStyle: 'none', gap: '2px' })}>
        {#each category.pages as p (p.id)}
          <li
            class={flex({
              position: 'relative',
              alignItems: 'center',
              textStyle: '15r',
              color: 'text.primary',
            })}
            aria-current={p.slug === currentSlug ? 'page' : undefined}
          >
            <a
              class={css({
                paddingX: '12px',
                paddingY: '7px',
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
                    color: 'var(--usersite-theme-color)',
                  },
                },
              })}
              aria-current={p.slug === currentSlug ? 'page' : undefined}
              href={`/ko/${p.slug}`}
              on:click={() => {
                $treeOpenState[p.slug] = true;
              }}
            >
              {p.content.title}
            </a>
            {#if p.children.length > 0}
              <button
                class={css({
                  position: 'absolute',
                  right: '7px',
                  top: '7px',
                  width: '22px',
                  height: '22px',
                  padding: '3px',
                  borderRadius: '4px',
                  color: 'neutral.70',
                  _hover: {
                    backgroundColor: 'var(--usersite-theme-color)/8',
                    color: 'var(--usersite-theme-color)',
                  },
                })}
                aria-expanded={$treeOpenState[p.slug] ? 'true' : 'false'}
                type="button"
                on:click={() => {
                  $treeOpenState[p.slug] = !$treeOpenState[p.slug];
                }}
              >
                <Icon ariaHidden={true} icon={$treeOpenState[p.slug] ? ChevronDownIcon : ChevronRightIcon} size={16} />
              </button>
            {/if}
          </li>
          {#if p.children.length > 0 && $treeOpenState[p.slug]}
            <ul class={flex({ direction: 'column', listStyle: 'none', gap: '2px' })}>
              {#each p.children as childPage (childPage.id)}
                <li class={css({ display: 'contents' })}>
                  <a
                    class={css({
                      padding: '7px',
                      paddingLeft: '32px',
                      textStyle: '15r',
                      color: 'text.primary',
                      borderRadius: '6px',
                      _hover: {
                        backgroundColor: 'var(--usersite-theme-color)/4',
                      },
                      _currentPage: {
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
