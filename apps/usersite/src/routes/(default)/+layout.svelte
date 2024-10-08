<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex, visuallyHidden } from '@readable/styled-system/patterns';
  import { Icon } from '@readable/ui/components';
  import { setContext } from 'svelte';
  import { writable } from 'svelte/store';
  import { swipe } from 'svelte-gestures';
  import CommandIcon from '~icons/lucide/command';
  import SearchIcon from '~icons/lucide/search';
  import ReadableIcon from '~icons/rdbl/readable';
  import { browser } from '$app/environment';
  import { env } from '$env/dynamic/public';
  import { graphql } from '$graphql';
  import { Img } from '$lib/components';
  import { hasCmd, mobileNavOpen, searchBarOpen } from '$lib/stores/ui';
  import MobileSidebar from './MobileSidebar.svelte';
  import Navigation from './Navigation.svelte';
  import SearchBar from './SearchBar.svelte';
  import type { SwipeCustomEvent } from 'svelte-gestures';

  $: query = graphql(`
    query DefaultLayout_Query($searchQuery: String!) {
      publicSite {
        id
        name
        url
        themeColor
        aiSearchEnabled

        logo {
          id
          url
          ...Img_image
        }

        firstPage {
          id
        }

        ...Navigation_publicSite
        ...SearchBar_publicSite
      }

      searchPublicPage(query: $searchQuery) {
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
            title

            ...PageUrl_publicPage
          }
        }
      }
    }
  `);

  const blurEffectThreshold = 100;
  const blurEffect = writable(browser ? window.scrollY < blurEffectThreshold : true);

  setContext('blurEffect', blurEffect);

  function openSearchBar() {
    searchBarOpen.set(true);
  }

  const swipeHandler = (event: SwipeCustomEvent) => {
    if (event.detail.direction === 'left') {
      mobileNavOpen.set(false);
    } else if (event.detail.direction === 'right') {
      mobileNavOpen.set(true);
    }
  };
</script>

<svelte:head>
  {#if $query.publicSite.logo}
    <link href={`${$query.publicSite.logo.url}?s=32&f=png`} rel="icon" sizes="32x32" type="image/png" />
  {/if}
</svelte:head>

<svelte:window on:scroll={() => ($blurEffect = window.scrollY < blurEffectThreshold)} />

<div
  style:--usersite-theme-color={$query.publicSite.themeColor}
  class={flex({ direction: 'column', minHeight: 'screen' })}
  on:swipe={swipeHandler}
  use:swipe={{
    touchAction: 'pan-y',
    minSwipeDistance: 60, // default
    timeFrame: 800,
  }}
>
  <a
    class={visuallyHidden({
      zIndex: '100',
      padding: '16px',
      color: 'neutral.0',
      backgroundColor: '[#005FCC]',
      borderBottomColor: 'border.primary',
      borderBottomWidth: '1px',
      textStyle: '16sb',
      _focus: {
        position: 'fixed',
        top: '0',
        left: '0',
        width: 'auto',
        height: 'auto',
        clip: 'auto',
      },
    })}
    href="#main-content"
  >
    메인 콘텐츠로 이동
  </a>

  <header
    class={css({
      display: 'flex',
      position: 'sticky',
      top: '0',
      left: '0',
      right: '0',
      zIndex: '50',
      alignItems: 'center',
      height: '64px',
      borderBottomColor: 'border.secondary',
      borderBottomWidth: {
        md: '1px',
        lg: '1px',
      },
    })}
  >
    <div
      class={css({
        hideBelow: 'md',
        position: 'absolute',
        inset: '0',
        transition: 'background',
        transitionDuration: '500ms',
        backgroundColor: $blurEffect ? 'surface.primary/60' : 'surface.primary',
        backdropFilter: 'auto',
        backdropBlur: '8px',
      })}
      aria-hidden="true"
    />
    <div
      class={flex({
        position: 'relative',
        alignItems: 'center',
        flex: '1',
        width: 'full',
        maxWidth: '1280px',
        marginX: 'auto',
        paddingX: '20px',
        gap: '16px',
        justifyContent: 'space-between',
      })}
    >
      <a class={css({ truncate: true })} href="/">
        <h1
          class={flex({
            flex: '1',
            alignItems: 'center',
            gap: '12px',
            truncate: true,
          })}
        >
          {#if $query.publicSite.logo}
            <Img
              style={css.raw({
                borderRadius: '6px',
                size: '28px',
              })}
              $image={$query.publicSite.logo}
              alt=""
              size={32}
            />
          {/if}
          <span class={css({ textStyle: '18b', truncate: true })}>{$query.publicSite.name}</span>
        </h1>
      </a>
      <div
        class={css({
          flexShrink: 0,
          hideBelow: 'md',
          width: '260px',
        })}
      >
        <button
          class={flex({
            width: 'full',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingX: '14px',
            height: '41px',
            borderRadius: '10px',
            borderWidth: '1px',
            borderColor: 'border.secondary',
            backgroundColor: 'surface.primary',
            _hover: {
              borderColor: 'border.primary',
              backgroundColor: 'surface.secondary',
            },
            color: 'text.tertiary',
            textStyle: '14r',
          })}
          aria-label="검색"
          type="button"
          on:click={openSearchBar}
        >
          <div class={flex({ alignItems: 'center', gap: '8px' })}>
            <Icon icon={SearchIcon} size={16} />
            <span>
              {#if $query.publicSite.aiSearchEnabled}
                묻거나 검색하기
              {:else}
                검색하기
              {/if}
            </span>
          </div>
          <div
            class={flex({
              borderRadius: '4px',
              paddingX: '6px',
              paddingY: '2px',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: 'surface.tertiary',
              color: 'text.tertiary',
              textStyle: '12sb',
              borderWidth: '1px',
            })}
          >
            {#if $hasCmd}
              <Icon icon={CommandIcon} size={12} />
            {:else}
              <span>Ctrl</span>
            {/if}
            <span>K</span>
          </div>
        </button>
      </div>
      <button
        class={flex({ hideFrom: 'md', marginLeft: 'auto', color: 'neutral.60' })}
        aria-label="검색"
        type="button"
        on:click={openSearchBar}
      >
        <Icon icon={SearchIcon} size={24} />
      </button>
    </div>
  </header>

  <SearchBar $publicSite={$query.publicSite} searchResults={$query.searchPublicPage.hits} />

  <div class={flex({ maxWidth: '1280px', marginX: 'auto', grow: '1', width: 'full' })}>
    {#if $query.publicSite.firstPage}
      <div
        class={css({
          hideBelow: 'md',
          position: 'sticky',
          top: '64px',
          width: '260px',
          height: '[calc(100vh - 64px)]',
          flexShrink: 0,
          paddingTop: '32px',
          paddingX: '20px',
          paddingBottom: '120px',
          overflow: 'auto',
        })}
      >
        <Navigation $publicSite={$query.publicSite} />
      </div>

      <MobileSidebar>
        <Navigation slot="navigation" $publicSite={$query.publicSite} />
      </MobileSidebar>
    {/if}

    <main id="main-content" class={flex({ flex: '1', width: 'full', alignItems: 'flex-start' })} tabindex="-1">
      <slot />
    </main>
  </div>
</div>

<!-- TODO: 결제하면 숨기기 -->
<a
  class={flex({
    'position': 'fixed',
    'bottom': '24px',
    'right': '28px',
    'gap': '6px',
    'paddingX': '12px',
    'paddingY': '9px',
    'alignItems': 'center',
    'borderRadius': '8px',
    'boxShadow': 'strong',
    'backgroundColor': {
      base: 'gray.1000',
      _dark: 'darkgray.100',
    },
    'color': 'neutral.0',
    '& svg path': {
      fill: 'neutral.0',
    },
    'textStyle': '13b',
  })}
  href={env.PUBLIC_WEBSITE_URL}
  rel="noopener noreferrer"
  target="_blank"
>
  <Icon icon={ReadableIcon} size={18} />
  <span>Powered by Readable</span>
</a>
