<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import GlyphLogo from '$assets/logos/glyph.svg?component';
  import PlanetLogo from '$assets/logos/planet.svg?component';
  import ZerobasedLogo from '$assets/logos/zerobased.svg?component';
</script>

<div class={css({ paddingY: { base: '54px', lg: '120px' }, paddingX: '20px' })}>
  <!-- prettier-ignore -->
  <p class={css({ textStyle: { base: '13m', lg: '22m' }, textAlign: 'center', color: 'text.secondary' })}>
    복잡한 설정 없이도
    <b class={css({ textStyle: { base: '13b', lg: '22b' }, color: 'text.primary' })}>전문가 수준의 도움센터를 제작</b>하세요
    <br />
    다양한 규모의 팀이 리더블과 함께하고 있습니다
  </p>

  <div
    class={flex({
      direction: 'column',
      align: 'center',
      justify: 'center',
      gap: { base: '8px', lg: '24px' },
      marginTop: '34px',
      lg: { flexDirection: 'row' },
    })}
  >
    <div class={css({ paddingTop: '14px', paddingBottom: '9px', paddingX: '29px' })}>
      <GlyphLogo class={css({ flex: 'none', height: '24px' })} />
    </div>
    <div class={css({ paddingY: '14px', paddingX: '17px' })}>
      <ZerobasedLogo class={css({ flex: 'none', height: '20px' })} />
    </div>
    <div class={css({ paddingY: '11px', paddingX: '30px' })}>
      <PlanetLogo class={css({ flex: 'none', height: '26px' })} />
    </div>
  </div>
</div>
