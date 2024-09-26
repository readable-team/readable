<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { writable } from 'svelte/store';
  import { browser } from '$app/environment';
  import FullLogo from '$assets/logos/full.svg?component';
  import FullWhiteLogo from '$assets/logos/full-white.svg?component';
  import { env } from '$env/dynamic/public';
  import type { ColorToken } from '@readable/styled-system/tokens';

  export let darkSections: HTMLElement[];

  type HeaderTheme = 'light' | 'dark';

  let scrollY = 0;
  let headerElem: HTMLHeadElement;

  const headerTheme = writable<HeaderTheme>('dark');

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
    {#if $headerTheme === 'dark'}
      <FullWhiteLogo
        class={css({
          height: '24px',
        })}
      />
    {:else}
      <FullLogo
        class={css({
          height: '24px',
        })}
      />
    {/if}

    <div
      class={flex({
        'gap': '48px',
        '& a': {
          display: 'inline-block',
          textStyle: '16sb',
          color: $headerTheme === 'dark' ? '[#E4E4E7]' : 'text.secondary',
          paddingX: '16px',
          paddingY: '13px',
        },
      })}
    >
      <a href="/pricing">가격정책</a>
      <a href="https://docs.rdbl.io">이용 가이드</a>
      <a href="https://updates.rdbl.io">업데이트 노트</a>
      <a href="/demo">데모 신청</a>
    </div>

    <div class={flex({ gap: '8px' })}>
      <a
        class={flex({
          borderRadius: '8px',
          paddingX: '20px',
          paddingY: '9px',
          textStyle: '14sb',
          height: '38px',
          borderWidth: '1px',
          ...($headerTheme === 'dark'
            ? {
                borderColor: 'darkgray.700',
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
        도입문의
      </a>
      <a
        class={flex({
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
  </div>
</header>
