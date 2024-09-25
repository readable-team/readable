<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import FullWhiteLogo from '$assets/logos/full-white.svg?component';
  import { env } from '$env/dynamic/public';

  let scrollY = 0;
</script>

<svelte:window on:scroll={() => (scrollY = window.scrollY)} />

<header
  class={flex({
    position: 'fixed',
    top: '0',
    left: '0',
    right: '0',
    height: '60px',
    zIndex: '100',
    backgroundColor: scrollY > 100 ? 'neutral.100' : 'transparent',
    transition: '[background-color 500ms ease-in-out]',
  })}
>
  <div
    class={flex({
      marginX: 'auto',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '1080px',
      borderBottom: '[1px solid rgba(63, 63, 70, 0.40)]',
    })}
  >
    <FullWhiteLogo
      class={css({
        height: '24px',
      })}
    />

    <div
      class={flex({
        'gap': '48px',
        '& a': {
          display: 'inline-block',
          textStyle: '16sb',
          color: '[#E4E4E7]',
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
          color: 'darkgray.200',
          backgroundColor: 'darkgray.800',
          _hover: { backgroundColor: 'darkgray.700' },
          _focusVisible: { backgroundColor: 'darkgray.700' },
          _active: { backgroundColor: 'darkgray.900' },
          _pressed: { backgroundColor: 'darkgray.900' },
        })}
        href={env.PUBLIC_DASHBOARD_URL}
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
