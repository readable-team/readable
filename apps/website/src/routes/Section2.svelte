<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex, grid } from '@readable/styled-system/patterns';
</script>

<section class={grid({ columns: 2, gap: '36px', maxWidth: '1104px' })}>
  <div
    class={css({
      borderRadius: '4px',
      padding: '40px',
      backgroundColor: 'gray.100/50',
      height: '860px',
      boxShadow: 'normal',
    })}
  >
    <div class={flex({ direction: 'column', height: 'full' })}>
      <div class={css({ width: 'full', height: '240px', backgroundColor: 'neutral.30' })} />

      <h3 class={css({ marginTop: 'auto', fontSize: '24px', fontWeight: 'bold' })}>
        잊고 살던 가이드 문서, 실제 제품과 동일하도록.
      </h3>
      <p class={css({ fontWeight: '[500]' })}>아웃데이트된 문서, 리더블에서 자동으로 쏙쏙 잡아 놓치지 않게 해드려요.</p>
    </div>
  </div>

  <div class={flex({ direction: 'column' })}>
    <div class={css({ paddingY: '44px', paddingRight: '92px' })}>
      <h2 class={css({ fontSize: '[46px]', fontWeight: '[900]' })}>
        도리의 거의 첨병에
        <br />
        그때야
        <mark>안정합니다</mark>
        <br />
        하나의 통일하여.
      </h2>
      <p class={css({ fontWeight: 'bold', color: 'neutral.70' })}>
        아주 귀의만, 선을 대한 품질도 영선공만 인체에 간석지를 구한다. 계산은 피로서 사람의 허용된 한계를 되어 수
        지나다.
      </p>
    </div>
    <div
      class={css({
        marginTop: 'auto',
        borderRadius: '4px',
        padding: '40px',
        backgroundColor: 'gray.100/50',
        height: '465px',
        boxShadow: 'normal',
      })}
    >
      <div class={flex({ direction: 'column', height: 'full' })}>
        <div class={css({ width: 'full', height: '240px', backgroundColor: 'neutral.30' })} />

        <h3 class={css({ marginTop: 'auto', fontSize: '24px', fontWeight: 'bold' })}>
          잊고 살던 가이드 문서, 실제 제품과 동일하도록.
        </h3>
        <p class={css({ fontWeight: '[500]' })}>
          아웃데이트된 문서, 리더블에서 자동으로 쏙쏙 잡아 놓치지 않게 해드려요.
        </p>
      </div>
    </div>
  </div>
</section>
