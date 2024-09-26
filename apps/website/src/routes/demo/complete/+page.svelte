<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
</script>

<div
  class={flex({
    direction: 'column',
    grow: '1',
    paddingTop: { base: '64px', lg: '140px' },
    paddingBottom: { base: '220px', lg: '[340px]' },
  })}
>
  <div class={css({ marginX: 'auto', paddingX: '20px', maxWidth: '726px' })}>
    <h1
      class={css({
        marginBottom: { base: '10px', lg: '16px' },
        fontSize: { base: '20px', lg: '[45px]' },
        fontWeight: '[800]',
        textAlign: 'center',
      })}
    >
      감사합니다
    </h1>

    <p class={css({ textStyle: { base: '13m', lg: '22m' }, color: 'text.tertiary', textAlign: 'center' })}>
      제출이 완료되었습니다.
      <br />
      확인 후 이메일로 연락드리겠습니다
    </p>
  </div>
</div>
