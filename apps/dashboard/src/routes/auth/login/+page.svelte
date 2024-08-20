<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Button } from '@readable/ui/components';
  import { SingleSignOnProvider } from '@/enums';
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
    background:
      '[linear-gradient(123deg, rgba(251, 96, 189, 0.10) 0%, rgba(251, 96, 189, 0.03) 21.07%, rgba(251, 96, 189, 0.00) 39.96%, rgba(249, 106, 25, 0.02) 74.93%, rgba(249, 106, 25, 0.10) 90.54%)]',
  })}
>
  <div class={css({ borderRadius: '8px', padding: '40px', width: 'full', maxWidth: '576px', boxShadow: 'emphasize' })}>
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
      })}
      size="lg"
      variant="secondary"
      on:click={async () => {
        const url = await generateSingleSignOnAuthorizationUrl({
          provider: SingleSignOnProvider.GOOGLE,
        });

        location.href = url;
      }}
    >
      <GoogleLogo class={css({ size: '18px' })} />
      <span>구글로 시작하기</span>
    </Button>
  </div>
</main>
