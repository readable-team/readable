<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Button, FormField, FormProvider, TextInput } from '@readable/ui/components';
  import { createMutationForm } from '@readable/ui/forms';
  import { z } from 'zod';
  import HeroLight from '$assets/hero/light.svg?component';
  import Header from '../Header.svelte';

  let darkSection: HTMLElement;

  const { form, context } = createMutationForm({
    schema: z.object({}),
    mutation: async () => {
      console.log('asdf');
    },
  });

  $: darkSections = [darkSection].filter(Boolean);
</script>

<HeroLight
  class={css({
    position: 'absolute',
    top: '-121px',
    left: '0',
    right: '0',
    marginX: 'auto',
    zIndex: '50',
    width: '1280px',
    height: '360px',
    lgDown: {
      width: 'full',
      height: '300px',
    },
  })}
/>

<Header {darkSections} theme="dark" />

<div
  bind:this={darkSection}
  class={flex({
    direction: 'column',
    grow: '1',
    paddingTop: { base: '128px', lg: '168px' },
    paddingBottom: { base: '80px', lg: '104px' },
    backgroundColor: 'neutral.100',
    color: 'white',
  })}
>
  <div class={css({ marginX: 'auto', paddingX: '20px', width: 'full', maxWidth: '726px' })}>
    <h1
      class={css({
        marginBottom: { base: '10px', lg: '16px' },
        fontSize: { base: '20px', lg: '[45px]' },
        fontWeight: '[800]',
        textAlign: 'center',
      })}
    >
      도입 문의
    </h1>

    <p class={css({ textStyle: { base: '13m', lg: '22m' }, textAlign: 'center' })}>
      팀 문서화의 고민, 리더블 전문가와 함께 해결하세요.
      <br />
      기존 문서 이전부터 최적의 활용 방법까지,
      <br />
      궁금한 점이 있으시다면 언제든 물어보세요.
    </p>
  </div>
</div>

<div class={css({ background: '[linear-gradient(180deg, #FFF 0%, #FAFAFA 74.47%)]' })}>
  <div class={css({ marginX: 'auto', paddingX: '20px', paddingBottom: '120px', width: 'full', maxWidth: '726px' })}>
    <FormProvider class={flex({ direction: 'column', gap: '16px', marginTop: '80px' })} {context} {form}>
      <FormField name="name" label="성함 *">
        <TextInput placeholder="username" />
      </FormField>
      <FormField name="email" label="이메일 *">
        <TextInput placeholder="company@example.com" />
      </FormField>
      <FormField name="number" label="전화번호">
        <TextInput placeholder="010-0000-0000" />
      </FormField>
      <FormField name="company" label="회사">
        <TextInput placeholder="abccompany" />
      </FormField>
      <FormField name="munhui" label="문의사항">
        <label
          class={flex({
            'align': 'center',
            'borderWidth': '1px',
            'borderColor': { base: 'gray.300', _dark: 'darkgray.700' },
            'borderRadius': '10px',
            'paddingX': '16px',
            'paddingY': '10px',
            'textStyle': '16r',
            'color': 'gray.1000',
            'backgroundColor': 'white',
            'transition': 'common',
            '_hover': {
              borderColor: 'brand.400',
            },
            '&:has(textarea:focus)': {
              borderColor: 'brand.600',
            },
          })}
        >
          <textarea
            class={css({
              flexGrow: '1',
              width: 'full',
              minWidth: '0',
              resize: 'none',
            })}
            placeholder="문의사항"
            rows="3"
          />
        </label>
      </FormField>

      <Button glossy size="lg" type="submit">문의하기</Button>
    </FormProvider>
  </div>
</div>
