<script lang="ts">
  import '../app.css';

  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Icon } from '@readable/ui/components';
  import IconGithub from '~icons/simple-icons/github';
  import FullLogo from '$assets/logos/full.svg?component';
</script>

<div class={flex({ direction: 'column', grow: '1', minHeight: 'screen' })}>
  <slot />

  <footer
    class={flex({
      marginX: 'auto',
      width: 'full',
      maxWidth: '1280px',
      direction: 'column',
      gap: '40px',
      paddingX: { base: '24px', lg: '32px' },
      paddingY: '48px',
      backgroundColor: 'neutral.0',
    })}
  >
    <div class={flex({ align: 'center', justify: 'space-between' })}>
      <FullLogo class={css({ height: { base: '20px', lg: '24px' } })} />

      <a aria-label="GitHub" href="https://github.com/readable-team" rel="noopener noreferrer" target="_blank">
        <Icon style={css.raw({ color: 'neutral.100', hideFrom: 'lg' })} icon={IconGithub} size={24} />
        <Icon style={css.raw({ color: 'neutral.100', hideBelow: 'lg' })} icon={IconGithub} size={32} />
      </a>
    </div>

    <div class={flex({ textStyle: { base: '12m', lg: '14m' }, color: 'neutral.70', direction: 'column', gap: '4px' })}>
      <p>주식회사 펜슬컴퍼니 | 대표 배준현 | 서울특별시 강남구 강남대로100길 14, 6층</p>

      <p>
        사업자등록번호 610-88-03078 | <a
          href="https://www.ftc.go.kr/bizCommPop.do?wrkr_no=6108803078"
          rel="noopener noreferrer"
          target="_blank"
        >
          통신판매업신고 2023-서울강남-4541
        </a>
      </p>

      <p>02-565-7695 | hello@penxle.io</p>
    </div>
  </footer>
</div>
