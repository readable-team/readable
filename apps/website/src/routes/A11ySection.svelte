<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { center, flex } from '@readable/styled-system/patterns';
  import KeyboardImage from '$assets/a11y-section/keyboard.svg?component';
  import ResponsiveImage from '$assets/a11y-section/responsive.svg?component';
  import ScreenReaderImage from '$assets/a11y-section/screen-reader.svg?component';
  import SectionTitle from './SectionTitle.svelte';

  const cards = [
    {
      image: KeyboardImage,
      title: '키보드 탐색',
      description: `ㅁㄴㅇㄹㅁㅇㄹ`,
    },
    {
      image: ScreenReaderImage,
      title: '스크린 리더 친화적',
      description: `ㅁㄴㅇㄹㅁㅇㄴㄹ`,
    },
    {
      image: ResponsiveImage,
      title: '전 범위 디바이스 최적화',
      description: `고성능 기기부터 저사양 디바이스까지 원활하게
작동하도록 최적화되었습니다`,
    },
  ];
</script>

<div class={css({ background: '[linear-gradient(180deg, #FFF 54.37%, #F7FAFF 100%)]' })}>
  <div
    class={css({
      width: '1280px',
      marginX: 'auto',
      paddingX: '20px',
      paddingY: '120px',
      lgDown: {
        width: 'full',
        paddingTop: '54px',
        paddingBottom: '40px',
      },
    })}
  >
    <SectionTitle>
      <span slot="subtitle" class={css({ color: '[#175DE5]' })}>접근성</span>
      <span slot="title">
        포용할 수 있는
        <br />
        도움센터
      </span>
      <span slot="description">
        <span>리더블로 만들어진 사이트는 다양한 사용자들이 문제 없이 콘텐츠에 접근할 수 있도록 설계되었습니다.</span>
        <br />
        <span>어떤 기기를 사용하든지, 나이나 신체적 특성 등에 관계없이</span>
        <em>&nbsp;원하는 내용을 손쉽게 찾아&nbsp;</em>
        <span>읽을 수 있습니다.</span>
      </span>
    </SectionTitle>

    <div class={flex({ marginTop: '120px', gap: '16px', lgDown: { marginTop: '74px', flexDirection: 'column' } })}>
      {#each cards as card (card.title)}
        <div class={flex({ flexDirection: 'column', gap: '10px' })}>
          <div
            class={flex({
              flexDirection: 'column',
              gap: '6px',
              flex: '1',
              height: '84px',
            })}
          >
            <div class={flex({ alignItems: 'center', gap: '8px' })}>
              <div class={css({ fontSize: '22px', fontWeight: '[700]', lgDown: { fontSize: '14px' } })}>
                {card.title}
              </div>
            </div>
            <div
              class={css({
                fontSize: '16px',
                fontWeight: '[500]',
                color: 'text.tertiary',
                whiteSpace: 'pre-line',
                lgDown: { fontSize: '12px' },
              })}
            >
              {card.description}
            </div>
          </div>

          <div class={center({ width: '403px', height: '177px', lgDown: { width: 'full' } })}>
            <svelte:component this={card.image} />
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>
