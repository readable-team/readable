<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex, visuallyHidden } from '@readable/styled-system/patterns';
  import { Icon } from '@readable/ui/components';
  import { setContext } from 'svelte';
  import { writable } from 'svelte/store';
  import SearchIcon from '~icons/lucide/search';
  import { browser } from '$app/environment';
  import { graphql } from '$graphql';
  import { Img } from '$lib/components';
  import { searchBarOpen } from '$lib/stores/ui';
  import MobileSidebar from './MobileSidebar.svelte';
  import Navigation from './Navigation.svelte';
  import SearchBar from './SearchBar.svelte';

  $: query = graphql(`
    query KoLayout_Query {
      publicSite {
        id
        name

        firstPage {
          id
        }

        logo {
          id
          ...Img_image
        }

        ...Navigation_publicSite
      }
    }
  `);

  const blurEffectThreshold = 100;
  const blurEffect = writable(browser ? window.scrollY < blurEffectThreshold : true);

  setContext('blurEffect', blurEffect);

  function openSearchBar() {
    searchBarOpen.set(true);
  }
</script>

<svelte:window on:scroll={() => ($blurEffect = window.scrollY < blurEffectThreshold)} />

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
        width: '[30%]',
        minWidth: '260px',
        maxWidth: '380px',
      })}
    >
      <button
        class={flex({
          width: 'full',
          alignItems: 'center',
          gap: '8px',
          paddingX: '14px',
          height: '41px',
          borderRadius: '10px',
          borderWidth: '1px',
          borderColor: 'border.secondary',
          backgroundColor: { base: 'white', _dark: 'darkgray.1000' },
          color: 'text.tertiary',
          textStyle: '14r',
        })}
        aria-label="검색"
        type="button"
        on:click={openSearchBar}
      >
        <Icon icon={SearchIcon} size={16} />
        <span>검색어를 입력해주세요</span>
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

<SearchBar />

<main
  id="main-content"
  class={flex({ maxWidth: '1280px', marginX: 'auto', alignItems: 'flex-start', grow: '1', width: 'full' })}
>
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

  <slot />
</main>
