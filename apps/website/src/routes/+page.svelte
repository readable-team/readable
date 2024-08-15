<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { center, flex } from '@readable/styled-system/patterns';
  import { Helmet } from '@readable/ui/components';
  import { onMount } from 'svelte';
  import { fly } from 'svelte/transition';
  import BrowserHero from '$assets/hero/browser.svg?component';
  import FullLogo from '$assets/logos/full.svg?component';
  import GlyphLogo from '$assets/logos/glyph.svg?component';
  import PlanetLogo from '$assets/logos/planet.svg?component';
  import ZerobasedLogo from '$assets/logos/zerobased.svg?component';

  const keywords = ['도움센터', '유저 가이드', '업데이트 노트', '개발자 문서'];

  let i = 0;
  $: idx = i % keywords.length;

  onMount(() => {
    const interval = setInterval(() => {
      i += 1;
    }, 2000);

    return () => clearInterval(interval);
  });
</script>

<Helmet title="5초만에 만드는 도움센터, 리더블" trailing={null} />

<div
  class={css({
    paddingTop: '80px',
    background:
      '[linear-gradient(110deg, rgba(251, 96, 189, 0.00) -5.83%, rgba(251, 96, 189, 0.10) -0.54%, rgba(251, 96, 189, 0.03) 31.21%, rgba(251, 96, 189, 0.00) 47.09%, rgba(249, 106, 25, 0.02) 61.91%, rgba(249, 106, 25, 0.10) 83.08%)]',
  })}
>
  <div class={flex({ marginX: 'auto', maxWidth: '1200px', paddingX: '48px' })}>
    <div class={css({ flex: 'none' })}>
      <FullLogo class={css({ height: '24px', marginBottom: '100px' })} />

      <div class={css({ fontSize: '[60px]', fontWeight: '[900]', marginBottom: '64px' })}>
        <div>이용자들이 사랑할</div>
        <div class={css({ position: 'relative' })}>
          &nbsp;
          {#key i}
            <div class={flex({ position: 'absolute', inset: '0' })}>
              <div
                class={flex({
                  textGradient: 'to-r',
                  gradientFrom: '[#F96A19]',
                  gradientTo: '[#FB60BD]',
                })}
                in:fly={{ y: 50, opacity: 0 }}
                out:fly={{ y: -20, opacity: 0 }}
              >
                {keywords[idx]}
              </div>
            </div>
          {/key}
        </div>
        <div>만들기</div>
      </div>

      <a
        class={css({
          display: 'inline-block',
          borderRadius: 'full',
          paddingX: '46px',
          paddingY: '12px',
          fontSize: '18px',
          fontWeight: '[900]',
          color: 'white',
          backgroundColor: 'neutral.100',
        })}
        href="#contact"
      >
        CTA TEXT
      </a>
    </div>

    <div class={css({ flexGrow: '1', minWidth: '160px' })} />

    <div class={css({ marginRight: '-48px', paddingTop: '100px', overflow: 'hidden' })}>
      <BrowserHero class={css({ height: '450px' })} />
    </div>
  </div>

  <div
    class={css({ height: '114px', backgroundGradient: 'to-b', gradientFrom: 'transparent', gradientTo: 'white' })}
  ></div>
</div>

<div
  class={center({ flexDirection: 'column', marginTop: '80px', marginX: 'auto', paddingX: '80px', maxWidth: '1200px' })}
>
  <div class={css({ textStyle: '16sb', color: 'neutral.50', marginBottom: '24px' })}>
    다양한 규모의 팀이 리더블과 함께 하고 있습니다.
  </div>

  <div class={flex({ width: 'full', justify: 'space-between', align: 'center', color: 'neutral.50' })}>
    <GlyphLogo class={css({ height: '24px' })} />
    <ZerobasedLogo class={css({ height: '24px' })} />
    <PlanetLogo class={css({ height: '24px' })} />
    <a
      class={css({
        display: 'inline-block',
        borderWidth: '1px',
        borderColor: 'neutral.50',
        borderStyle: 'dashed',
        borderRadius: 'full',
        paddingX: '24px',
        paddingY: '14px',
        backgroundColor: '[#F4F4F5]',
      })}
      href="#contact"
    >
      그 다음은?
    </a>
  </div>
</div>
