<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Icon } from '@readable/ui/components';
  import * as R from 'remeda';
  import { tick } from 'svelte';
  import CircleXIcon from '~icons/lucide/circle-x';
  import MoveLeftIcon from '~icons/lucide/move-left';
  import SearchIcon from '~icons/lucide/search';
  import { beforeNavigate, goto } from '$app/navigation';
  import { graphql } from '$graphql';
  import { searchBarOpen } from '$lib/stores/ui';

  let searchQuery = '';
  let searchResults: Awaited<ReturnType<typeof searchPublicPage.refetch>>['searchPublicPage']['hits'] = [];

  const searchPublicPage = graphql(`
    query SearchBar_Query($query: String!) @manual {
      searchPublicPage(query: $query) {
        estimatedTotalHits
        hits {
          highlight {
            title
            subtitle
            text
          }
          page {
            id
            slug
            content {
              title
            }
          }
        }
      }
    }
  `);

  const debouncedSearch = R.debounce(
    async (query: string) => {
      if (query.length > 0) {
        const result = await searchPublicPage.refetch({ query });
        searchResults = result.searchPublicPage.hits;
        selectedResultIndex = null;
      }
    },
    {
      timing: 'trailing',
      waitMs: 16,
    },
  );

  $: debouncedSearch.call(searchQuery);

  function closeModal() {
    searchBarOpen.set(false);
    searchQuery = '';
    searchResults = [];
    selectedResultIndex = null;
  }

  function clearSearch(e: MouseEvent) {
    e.stopPropagation();
    searchQuery = '';
    searchResults = [];
    selectedResultIndex = null;
    inputEl.focus();
  }

  let modalEl: HTMLDivElement;
  let inputEl: HTMLInputElement;
  let listEl: HTMLUListElement;
  let selectedResultIndex: number | null = null;

  $: if ($searchBarOpen) {
    // eslint-disable-next-line unicorn/prefer-top-level-await
    tick().then(() => {
      inputEl.focus();
    });
  }

  function handleInputKeyDown(event: KeyboardEvent) {
    if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && event.isComposing) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  async function handleKeyDown(event: KeyboardEvent) {
    if ($searchBarOpen) {
      if (event.key === 'Escape') {
        closeModal();
        return;
      }

      if (event.key === 'Enter' && selectedResultIndex !== null) {
        event.preventDefault();
        goto(`/ko/${searchResults[selectedResultIndex].page.slug}`);
        return;
      }

      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        if (selectedResultIndex === null) {
          selectedResultIndex = 0;
        } else if (event.key === 'ArrowDown') {
          selectedResultIndex = (selectedResultIndex + 1) % searchResults.length;
        } else if (event.key === 'ArrowUp') {
          selectedResultIndex = (selectedResultIndex - 1 + searchResults.length) % searchResults.length;
        }
      }

      await tick();
      const selectedElem = listEl.querySelector('& > a[aria-selected="true"') as HTMLElement | null;
      if (
        selectedElem &&
        (selectedElem.offsetTop < listEl.scrollTop ||
          selectedElem.offsetTop + selectedElem.clientHeight > listEl.scrollTop + listEl.clientHeight)
      ) {
        selectedElem.scrollIntoView({
          block: 'nearest',
        });
      }
    } else {
      const metaKeyOnly = event.metaKey && !event.ctrlKey && !event.altKey && !event.shiftKey;
      if (!$searchBarOpen && event.key === 'k' && metaKeyOnly) {
        event.preventDefault();
        searchBarOpen.set(true);
      }
    }
  }

  beforeNavigate(() => {
    closeModal();
  });
</script>

<svelte:window on:keydown={handleKeyDown} />

{#if $searchBarOpen}
  <div
    class={css({
      position: 'fixed',
      zIndex: '50',
      paddingTop: '48px',
      paddingX: '80px',
      smOnly: {
        padding: '0',
      },
      inset: '0',
    })}
  >
    <div
      class={css({
        hideBelow: 'md',
        position: 'fixed',
        inset: '0',
        backgroundColor: 'white/16',
        backdropFilter: '[blur(12px)]',
      })}
      aria-label="검색 모드 닫기"
      role="button"
      tabindex="-1"
      on:click={closeModal}
      on:keydown={closeModal}
    />
    <div
      bind:this={modalEl}
      class={flex({
        position: 'relative',
        zIndex: '100',
        flexDirection: 'column',
        width: 'full',
        marginX: 'auto',
        maxWidth: '850px',
        maxHeight: '590px',
        backgroundColor: 'surface.primary',
        borderRadius: { md: '[22px]' },
        boxShadow: 'heavy',
        padding: '8px',
        smOnly: {
          height: 'screen',
          maxHeight: 'none',
          padding: '0',
        },
      })}
    >
      <div
        class={flex({
          alignItems: 'center',
          smOnly: {
            gap: '12px',
            height: '64px',
            paddingX: '20px',
            borderBottomWidth: '1px',
            borderColor: 'border.secondary',
          },
        })}
      >
        <button class={flex({ hideFrom: 'md' })} aria-label="검색 모드 닫기" type="button" on:click={closeModal}>
          <Icon icon={MoveLeftIcon} size={24} />
        </button>
        <label
          class={flex({
            'position': 'relative',
            'width': 'full',
            'borderRadius': '14px',
            'textStyle': '16m',
            'alignItems': 'center',
            'borderWidth': '1px',
            'borderColor': { base: 'gray.300', _dark: 'darkgray.700' },
            'paddingX': '18px',
            'color': { base: 'gray.500', _dark: 'darkgray.400' },
            'backgroundColor': { base: 'white', _dark: 'darkgray.1000' },
            'transition': 'common',
            '& input::placeholder': {
              color: { base: 'gray.600', _dark: 'darkgray.400' },
            },
            '_hover': {
              borderColor: 'var(--usersite-theme-color)/46',
            },
            '_hasFocusedInput': {
              borderColor: 'var(--usersite-theme-color)',
              outlineWidth: '1px',
              outlineColor: 'var(--usersite-theme-color)',
            },
            '_hasFilledInput': {
              color: { base: 'gray.1000', _dark: 'darkgray.100' },
              borderColor: { base: 'gray.300', _dark: 'darkgray.700' },
            },
            '_hasDisabledInput': {
              color: { base: 'gray.500', _dark: 'darkgray.600' },
              backgroundColor: { base: 'gray.200', _dark: 'darkgray.900' },
              borderColor: { base: 'gray.200', _dark: 'darkgray.700' },
            },
            '_hasInvalidInput': {
              borderColor: { base: 'red.600', _dark: 'red.500' },
              _hasFocusedInput: {
                borderColor: { base: 'red.600', _dark: 'red.500' },
              },
              _hasFilledInput: {
                color: { base: 'gray.1000', _dark: 'darkgray.100' },
                backgroundColor: { base: 'white', _dark: 'darkgray.1000' },
              },
            },
          })}
        >
          <Icon style={css.raw({ marginRight: '8px' })} icon={SearchIcon} size={18} />

          <input
            bind:this={inputEl}
            class={css({
              width: 'full',
              paddingY: '8px',
              height: '47px',
            })}
            aria-live={searchQuery ? 'polite' : 'off'}
            placeholder="검색어를 입력하세요"
            type="text"
            bind:value={searchQuery}
            on:keydown={handleInputKeyDown}
          />
          {#if searchQuery}
            <button
              class={css({
                position: 'absolute',
                right: '16px',
                top: '[50%]',
                transform: 'translateY(-50%)',
                cursor: 'pointer',
                color: 'neutral.50',
              })}
              aria-label="검색어 지우기"
              type="button"
              on:click={clearSearch}
            >
              <Icon icon={CircleXIcon} size={18} />
            </button>
          {/if}
        </label>
      </div>
      {#if searchResults.length > 0}
        <ul bind:this={listEl} class={css({ paddingY: '12px', overflowY: 'auto', smOnly: { paddingX: '20px' } })}>
          {#each searchResults as result, index (result.page.id)}
            <a
              class={flex({
                flexDirection: 'column',
                gap: '2px',
                paddingX: '18px',
                paddingY: '16px',
                cursor: 'pointer',
                borderRadius: '10px',
                _hover: {
                  backgroundColor: 'var(--usersite-theme-color)/4',
                },
                _selected: {
                  backgroundColor: 'var(--usersite-theme-color)/4',
                },
                _focus: {
                  backgroundColor: 'var(--usersite-theme-color)/4',
                },
              })}
              aria-selected={selectedResultIndex === index}
              href={`/ko/${result.page.slug}`}
              role="option"
              tabindex="0"
              on:focus={() => {
                selectedResultIndex = index;
              }}
            >
              <h3
                class={css({
                  'color': 'text.primary',
                  'textStyle': '16sb',
                  '& em': {
                    color: 'var(--usersite-theme-color)',
                  },
                })}
                aria-label={result.page.content.title}
              >
                {@html result.highlight?.title || result.page.content.title}
              </h3>
              {#if result.highlight?.text}
                <p
                  class={css({
                    'color': 'text.secondary',
                    'textStyle': '14r',
                    '& em': {
                      color: 'var(--usersite-theme-color)',
                    },
                  })}
                  aria-label={result.highlight.text}
                >
                  {@html result.highlight.text}
                </p>
              {/if}
            </a>
          {/each}
        </ul>
      {:else if searchQuery.length > 0}
        <div
          class={flex({
            marginTop: '12px',
            flexDirection: 'column',
            paddingX: '18px',
            smOnly: {
              paddingX: '38px',
            },
            paddingY: '16px',
            color: 'text.tertiary',
            gap: '2px',
          })}
        >
          <p class={css({ textStyle: '16sb' })}>검색결과가 없어요</p>
          <p class={css({ textStyle: '14r' })}>다른 검색어를 입력해주세요</p>
        </div>
      {/if}
    </div>
  </div>
{/if}
