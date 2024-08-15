<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex, grid, gridItem } from '@readable/styled-system/patterns';
</script>

<section class={grid({ columns: 3, rowGap: '24px', columnGap: '24px', minChildWidth: '426px', maxWidth: '1104px' })}>
  <div
    class={gridItem({
      colSpan: 1,
      rowSpan: 1,
      borderRadius: '4px',
      padding: '40px',
      backgroundColor: 'gray.100/50',
      height: '520px',
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
  <div
    class={gridItem({
      colSpan: 2,
      rowSpan: 1,
      borderRadius: '4px',
      padding: '40px',
      backgroundColor: 'gray.100/50',
      height: '520px',
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

  <div
    class={gridItem({
      colSpan: 2,
      rowSpan: 1,
      borderRadius: '4px',
      padding: '40px',
      backgroundColor: 'gray.100/50',
      height: '520px',
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
  <div
    class={gridItem({
      colSpan: 1,
      rowSpan: 1,
      borderRadius: '4px',
      padding: '40px',
      backgroundColor: 'gray.100/50',
      height: '520px',
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
</section>
