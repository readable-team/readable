<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Button, Icon } from '@readable/ui/components';
  import ChevronRightIcon from '~icons/lucide/chevron-right';
  import { env } from '$env/dynamic/public';
</script>

<div
  class={css({
    paddingY: { base: '54px', lg: '120px' },
    background: '[linear-gradient(108deg, rgba(255, 123, 46, 1.00) 4.37%, rgba(255, 106, 69, 1.00) 85.95%)]',
  })}
>
  <div
    class={flex({
      align: 'center',
      justify: 'space-between',
      gap: '40px',
      marginX: 'auto',
      paddingX: '20px',
      maxWidth: '1280px',
      lgDown: { flexDirection: 'column' },
    })}
  >
    <div class={css({ color: 'white' })}>
      <h2
        class={css({
          marginBottom: { base: '10px', lg: '16px' },
          fontSize: { base: '18px', lg: '[45px]' },
          fontWeight: '[800]',
          lgDown: { textAlign: 'center' },
        })}
      >
        지금, 가이드문서가 없어도
        <br />
        시작해보세요
      </h2>

      <p class={css({ textStyle: { base: '13m', lg: '20m' }, lgDown: { textAlign: 'center' } })}>
        기존 문서를 쉽게 임포트하고
        <br />
        즉시 리더블의 강력한 기능을 경험하세요
      </p>
    </div>

    <div class={flex({ align: 'center', gap: { base: '16px', lg: '32px' }, lgDown: { flexDirection: 'column' } })}>
      <Button href={env.PUBLIC_DASHBOARD_URL} size="lg" type="link" variant="secondary">지금 써보러가기</Button>

      <a
        class={flex({
          gap: '6px',
          alignItems: 'center',
          textStyle: '18sb',
          color: 'white',
        })}
        href="https://docs.rdbl.io"
      >
        활용 사례 보기
        <Icon icon={ChevronRightIcon} size={20} />
      </a>
    </div>
  </div>
</div>
