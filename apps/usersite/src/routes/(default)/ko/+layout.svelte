<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Icon } from '@readable/ui/components';
  import ChevronDownIcon from '~icons/lucide/chevron-down';
  import ChevronRightIcon from '~icons/lucide/chevron-right';
  import { page } from '$app/stores';
  import { graphql } from '$graphql';
  import { Img } from '$lib/components';

  $: query = graphql(`
    query KoLayout_Query($hostname: String!) {
      publicSite(hostname: $hostname) {
        id
        name

        logo {
          id
          ...Img_image
        }

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
    }
  `);

  let treeOpenState: Record<string, boolean> = {};
  $: currentSlug = $page.params.slug.split('-', 2)[0];
</script>

<header
  class={flex({
    alignItems: 'center',
    height: '64px',
    borderBottomWidth: '1px',
    borderBottomColor: 'border.primary',
  })}
>
  <div class={css({ flex: '1', maxWidth: '1280px', marginX: 'auto', paddingX: '20px' })}>
    <h1 class={flex({ alignItems: 'center', gap: '6px', maxWidth: '394px', textStyle: '16b' })}>
      {#if $query.publicSite.logo}
        <Img
          style={css.raw({
            size: '24px',
          })}
          $image={$query.publicSite.logo}
          alt=""
          size={24}
        />
      {/if}
      <span>{$query.publicSite.name}</span>
    </h1>
  </div>
</header>

<main class={flex({ maxWidth: '1280px', marginX: 'auto' })}>
  <aside class={css({ width: '240px', flexShrink: 0, padding: '20px' })}>
    <nav class={flex({ direction: 'column', gap: '24px' })}>
      {#each $query.publicSite.categories as category (category.id)}
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
  </aside>

  <div class={css({ flex: '1', paddingX: '50px', paddingTop: '20px', paddingBottom: '120px' })}>
    <slot />
  </div>
</main>
