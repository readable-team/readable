<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Icon } from '@readable/ui/components';
  import { onMount } from 'svelte';
  import { fly } from 'svelte/transition';
  import ChevronRightIcon from '~icons/lucide/chevron-right';
  import EditorMockupImage from '$assets/hero/editor-mockup.svg';
  import SiteMockupImage from '$assets/hero/site-mockup.svg';
  import { env } from '$env/dynamic/public';
  import SegmentButtons from './SegmentButtons.svelte';

  const keywords = ['도움센터', '유저 가이드', '업데이트 노트', '개발자 문서'];

  let i = 0;
  $: idx = i % keywords.length;

  let selectedHeroMockup = 'site';

  onMount(() => {
    const interval = setInterval(() => {
      i += 1;
    }, 2000);

    return () => clearInterval(interval);
  });
</script>

<div
  class={flex({
    position: 'relative',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'neutral.100',
    height: 'screen',
    minHeight: '1096px',
    overflow: 'hidden',
    color: 'white',
    paddingTop: '210px',
  })}
>
  <div
    class={css({
      fontSize: '[64px]',
      fontWeight: '[900]',
      textAlign: 'center',
    })}
  >
    <div>이용자를 붙잡을</div>
    <div class={css({ position: 'relative' })}>
      &nbsp;
      {#key i}
        <div class={flex({ position: 'absolute', inset: '0', justifyContent: 'center' })}>
          <div
            class={flex({
              textGradient: 'to-b',
              gradientFrom: '[#FFCB9A 0%]',
              gradientTo: '[#FF5D00 83.5%]',
            })}
            in:fly={{ y: 50, opacity: 0 }}
            out:fly={{ y: -20, opacity: 0 }}
          >
            {keywords[idx]}
          </div>
        </div>
      {/key}
    </div>
    <!-- <div>만들기</div> -->
  </div>

  <div class={flex({ marginTop: '40px', gap: '32px', alignItems: 'center' })}>
    <a
      class={flex({
        borderRadius: '10px',
        paddingX: '30px',
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
      지금 써보러 가기
    </a>
    <a
      class={flex({
        gap: '6px',
        alignItems: 'center',
        textStyle: '16sb',
        color: 'white/80',
      })}
      href="https://docs.rdbl.io"
    >
      활용 사례 보기
      <Icon icon={ChevronRightIcon} size={20} />
    </a>
  </div>

  <div class={css({ marginTop: '60px' })}>
    <SegmentButtons
      items={[
        { label: '사이트', value: 'site' },
        { label: '에디터', value: 'editor' },
      ]}
      on:select={(value) => (selectedHeroMockup = value.detail)}
    />
  </div>
  <div class={css({ marginTop: '34px', width: '889px' })}>
    <img alt="사이트 이미지" hidden={selectedHeroMockup !== 'site'} src={SiteMockupImage} />
    <img alt="에디터 이미지" hidden={selectedHeroMockup !== 'editor'} src={EditorMockupImage} />
  </div>
</div>
