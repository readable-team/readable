<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { center, flex } from '@readable/styled-system/patterns';
  import { scrollLock } from '@readable/ui/actions';
  import { Icon } from '@readable/ui/components';
  import { writable } from 'svelte/store';
  import MenuIcon from '~icons/lucide/menu';
  import CloseIcon from '~icons/lucide/x';
  import { browser } from '$app/environment';
  import { beforeNavigate } from '$app/navigation';
  import FullLogo from '$assets/logos/full.svg';
  import FullWhiteLogo from '$assets/logos/full-white.svg';
  import { env } from '$env/dynamic/public';
  import type { ColorToken } from '@readable/styled-system/tokens';

  export let theme: HeaderTheme;
  export let darkSections: HTMLElement[] = [];

  type HeaderTheme = 'light' | 'dark';

  let scrollY = 0;
  let headerElem: HTMLHeadElement;

  const headerTheme = writable<HeaderTheme>(theme);
  const isMenuOpen = writable(false);

  function toggleMenu() {
    $isMenuOpen = !$isMenuOpen;
  }

  $: if (browser && darkSections.length > 0 && headerElem) {
    let currentTheme: HeaderTheme = 'light';

    const headerHeight = headerElem.offsetHeight;
    for (const section of darkSections) {
      if (
        section.offsetTop - headerHeight < scrollY &&
        section.offsetTop + section.offsetHeight - headerHeight > scrollY
      ) {
        currentTheme = 'dark';
        break;
      }
    }

    headerTheme.set(currentTheme);
  }

  $: headerBgColor = ($headerTheme === 'light' ? 'white' : 'neutral.100') as ColorToken;

  beforeNavigate(() => {
    $isMenuOpen = false;
  });
</script>

<svelte:window bind:scrollY />

<header
  bind:this={headerElem}
  class={flex({
    position: 'fixed',
    top: '0',
    left: '0',
    right: '0',
    height: '60px',
    lgDown: {
      height: '64px',
      paddingX: '20px',
    },
    zIndex: '100',
    backgroundColor: scrollY > 100 ? headerBgColor : 'transparent',
    transition: '[all 500ms cubic-bezier(0.3, 0, 0, 1)]',
  })}
>
  <div
    class={flex({
      marginX: 'auto',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '1080px',
      borderBottom:
        $headerTheme === 'dark' ? '[1px solid rgba(63, 63, 70, 0.40)]' : '[1px solid rgba(228, 228, 231, 0.40)]',
    })}
  >
    <a href="/">
      <img
        class={css({
          height: '22px',
          lgDown: {
            height: '18px',
          },
        })}
        alt="Readable"
        src={$headerTheme === 'dark' ? FullWhiteLogo : FullLogo}
      />
    </a>

    <div
      class={flex({
        'gap': '48px',
        '& a': {
          display: 'inline-block',
          textStyle: '15b',
          color: $headerTheme === 'dark' ? '[#E4E4E7]' : 'text.secondary',
          paddingX: '16px',
          paddingY: '13px',
        },
        'lgDown': {
          display: 'none',
        },
      })}
    >
      <a href="/pricing">가격 안내</a>
      <a href="https://docs.rdbl.io" rel="noopener noreferrer" target="_blank">이용 가이드</a>
      <a href="https://updates.rdbl.io" rel="noopener noreferrer" target="_blank">업데이트 노트</a>
      <a href="/preview">이사 신청</a>
    </div>

    <div class={flex({ gap: '8px', lgDown: { display: 'none' } })}>
      <a
        class={center({
          borderRadius: '8px',
          paddingX: '20px',
          paddingY: '9px',
          textStyle: '14sb',
          height: '38px',
          borderWidth: '1px',
          ...($headerTheme === 'dark'
            ? {
                borderColor: 'darkgray.800',
                color: 'darkgray.200',
                backgroundColor: 'darkgray.800',
                _hover: { backgroundColor: 'darkgray.700' },
                _focusVisible: { backgroundColor: 'darkgray.700' },
                _active: { backgroundColor: 'darkgray.900' },
                _pressed: { backgroundColor: 'darkgray.900' },
              }
            : {
                borderColor: 'gray.300',
                color: 'gray.700',
                backgroundColor: 'white',
                _hover: { backgroundColor: 'gray.100' },
                _focusVisible: { backgroundColor: 'gray.100' },
                _active: { backgroundColor: 'gray.300' },
                _pressed: { backgroundColor: 'gray.300' },
              }),
        })}
        href="/contact"
      >
        도입 문의
      </a>
      <a
        class={center({
          borderRadius: '8px',
          paddingX: '20px',
          paddingY: '9px',
          textStyle: '14sb',
          height: '38px',
          color: 'white',
          backgroundColor: 'brand.600',
          _hover: { backgroundColor: 'brand.500' },
          _focusVisible: { backgroundColor: 'brand.500' },
          _active: { backgroundColor: 'brand.700' },
          _pressed: { backgroundColor: 'brand.700' },
        })}
        href={env.PUBLIC_DASHBOARD_URL}
      >
        로그인
      </a>
    </div>

    <button
      class={flex({ lgOnly: { display: 'none' }, color: $headerTheme === 'dark' ? 'white' : 'gray.1000' })}
      type="button"
      on:click={toggleMenu}
    >
      <Icon icon={$isMenuOpen ? CloseIcon : MenuIcon} size={24} />
    </button>
  </div>
</header>

{#if $isMenuOpen}
  <div
    class={css({
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      backgroundColor: 'white',
      zIndex: '[200]',
    })}
    use:scrollLock
  >
    <div class={css({ paddingX: '20px' })}>
      <div
        class={flex({
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingY: '20px',
          maxWidth: '1080px',
          marginX: 'auto',
        })}
      >
        <img
          class={css({
            height: '22px',
            lgDown: {
              height: '18px',
            },
          })}
          alt="Readable"
          src={FullLogo}
        />
        <button type="button" on:click={toggleMenu}>
          <Icon icon={CloseIcon} size={24} />
        </button>
      </div>
    </div>
    <div
      class={flex({
        flexDirection: 'column',
        width: 'full',
        height: 'full',
        maxWidth: '1080px',
        marginX: 'auto',
      })}
    >
      <nav
        class={flex({
          'flexDirection': 'column',
          '& > a': {
            textStyle: '16sb',
            paddingX: '16px',
            paddingY: '20px',
            color: 'text.secondary',
          },
        })}
      >
        <a href="/pricing">가격 안내</a>
        <a href="https://docs.rdbl.io" rel="noopener noreferrer" target="_blank">이용 가이드</a>
        <a href="https://updates.rdbl.io" rel="noopener noreferrer" target="_blank">업데이트 노트</a>
        <a href="/preview">이사 신청</a>
      </nav>
      <div
        class={flex({
          marginTop: 'auto',
          flexDirection: 'column',
          gap: '8px',
          padding: '20px',
          paddingBottom: '40px',
        })}
      >
        <a
          class={flex({
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: '8px',
            paddingY: '10px',
            textStyle: '16sb',
            color: 'gray.700',
            backgroundColor: 'white',
            _hover: { backgroundColor: 'gray.100' },
            _focusVisible: { backgroundColor: 'gray.100' },
            _active: { backgroundColor: 'gray.300' },
            _pressed: { backgroundColor: 'gray.300' },
            borderColor: 'gray.300',
            borderWidth: '1px',
          })}
          href="/contact"
        >
          도입 문의
        </a>
        <a
          class={flex({
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: '10px',
            paddingX: '20px',
            paddingY: '10px',
            textStyle: '16sb',
            height: '43px',
            color: 'white',
            backgroundColor: 'brand.600',
            _hover: { backgroundColor: 'brand.500' },
            _focusVisible: { backgroundColor: 'brand.500' },
            _active: { backgroundColor: 'brand.700' },
            _pressed: { backgroundColor: 'brand.700' },
          })}
          href={env.PUBLIC_DASHBOARD_URL}
        >
          로그인
        </a>
      </div>
    </div>
  </div>
{/if}
