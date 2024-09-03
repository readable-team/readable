<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Button, Icon } from '@readable/ui/components';
  import { SingleSignOnProvider } from '@/enums';
  import IconGithub from '~icons/simple-icons/github';
  import { page } from '$app/stores';
  import GoogleLogo from '$assets/icons/google.svg?component';
  import FullLogo from '$assets/logos/full.svg?component';
  import { graphql } from '$graphql';

  const generateSingleSignOnAuthorizationUrl = graphql(`
    mutation LoginPage_GenerateSingleSignOnAuthorizationUrl_Mutation(
      $input: GenerateSingleSignOnAuthorizationUrlInput!
    ) {
      generateSingleSignOnAuthorizationUrl(input: $input)
    }
  `);
</script>

<main
  class={flex({
    direction: 'column',
    align: 'center',
    justify: 'center',
    grow: 1,
    minHeight: 'screen',
    background:
      '[linear-gradient(123deg, rgba(251, 96, 189, 0.10) 0%, rgba(251, 96, 189, 0.03) 21.07%, rgba(251, 96, 189, 0.00) 39.96%, rgba(249, 106, 25, 0.02) 74.93%, rgba(249, 106, 25, 0.10) 90.54%)]',
  })}
>
  <div
    class={css({
      borderRadius: '8px',
      padding: '40px',
      width: 'full',
      maxWidth: '576px',
      boxShadow: 'emphasize',
      backgroundColor: 'surface.primary',
    })}
  >
    <a href="/">
      <FullLogo class={css({ height: '20px' })} />
    </a>

    <h1 class={css({ marginTop: '40px', marginBottom: '12px', textStyle: '28b' })}>로그인/회원가입</h1>

    <p class={css({ marginBottom: '80px', textStyle: '20sb', color: 'neutral.70' })}>
      제품과 문서를 동기화하고
      <br />
      신뢰할 수 있는 가이드 문서를 만들어 보세요
    </p>

    <Button
      style={flex.raw({
        align: 'center',
        justify: 'center',
        gap: '16px',
        paddingX: '40px',
        textStyle: '16b',
        color: 'neutral.90',
      })}
      size="lg"
      variant="secondary"
      on:click={async () => {
        const url = await generateSingleSignOnAuthorizationUrl({
          provider: SingleSignOnProvider.GOOGLE,
          email: $page.url.searchParams.get('email'),
        });

        location.href = url;
      }}
    >
      <GoogleLogo class={css({ size: '18px' })} />
      <span>구글로 시작하기</span>
    </Button>
  </div>
</main>

<footer
  class={flex({
    marginX: 'auto',
    maxWidth: '1200px',
    direction: 'column',
    gap: '40px',
    paddingX: { base: '24px', md: '48px' },
    paddingY: '48px',
    backgroundColor: 'neutral.0',
    width: 'full',
  })}
>
  <div class={flex({ align: 'center', justify: 'space-between' })}>
    <FullLogo class={css({ height: { base: '20px', md: '24px' } })} />

    <a aria-label="GitHub" href="https://github.com/readable-team" rel="noopener noreferrer" target="_blank">
      <Icon style={css.raw({ color: '[#181717]', hideFrom: 'md' })} icon={IconGithub} size={20} />
      <Icon style={css.raw({ color: '[#181717]', hideBelow: 'md' })} icon={IconGithub} size={24} />
    </a>
  </div>

  <div class={flex({ textStyle: { base: '12m', md: '14m' }, color: 'neutral.70', direction: 'column', gap: '4px' })}>
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

  <div class={css({ height: '20px' })}></div>
</footer>
