<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import GlyphLogo from '$assets/logos/glyph.svg?component';
  import PlanetLogo from '$assets/logos/planet.svg?component';
  import ZerobasedLogo from '$assets/logos/zerobased.svg?component';
</script>

<div class={css({ paddingY: { base: '120px', lg: '200px' }, paddingX: '20px' })}>
  <!-- prettier-ignore -->
  <p class={css({ textStyle: { base: '16m', lg: '24m' }, textAlign: 'center', color: 'text.secondary' })}>
    복잡한 설정 없이도
    <b class={css({ textStyle: { base: '16b', lg: '24b' }, color: 'text.primary' })}>전문가 수준의 도움센터를 제작</b>하세요.
    <br class={css({ hideBelow: 'md' })}/>
    다양한 규모의 팀이 리더블과 함께하고 있습니다.
  </p>

  <div
    class={flex({
      align: 'center',
      justify: 'center',
      gap: { base: '16px', lg: '24px' },
      wrap: 'wrap',
      marginTop: '34px',
    })}
  >
    <div class={css({ paddingTop: '14px', paddingBottom: '9px', paddingX: '29px' })}>
      <GlyphLogo class={css({ flex: 'none', height: { base: '28px', md: '36px' } })} />
    </div>
    <div class={css({ paddingY: '14px', paddingX: '17px' })}>
      <ZerobasedLogo class={css({ flex: 'none', height: { base: '22px', md: '30px' } })} />
    </div>
    <div class={css({ paddingY: '11px', paddingX: '30px' })}>
      <PlanetLogo class={css({ flex: 'none', height: { base: '31px', md: '39px' } })} />
    </div>
  </div>
</div>
