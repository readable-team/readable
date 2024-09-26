<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Button, FormField, FormProvider, TextInput } from '@readable/ui/components';
  import { createMutationForm } from '@readable/ui/forms';
  import { z } from 'zod';

  const { form, context } = createMutationForm({
    schema: z.object({}),
    mutation: async () => {
      console.log('asdf');
    },
  });
</script>

<div
  class={flex({
    direction: 'column',
    grow: '1',
    paddingTop: { base: '64px', lg: '140px' },
    paddingBottom: { base: '120px', lg: '200px' },
    background: '[linear-gradient(180deg, #FFF 0%, #FAFAFA 74.47%)]',
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

    <p class={css({ textStyle: { base: '13m', lg: '22m' }, color: 'text.tertiary', textAlign: 'center' })}>
      팀 문서화의 고민, 리더블 전문가와 함께 해결하세요.
      <br />
      기존 문서 이전부터 최적의 활용 방법까지,
      <br />
      맞춤형 무료 데모로 리더블의 가치를 직접 경험해보세요.
    </p>

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
      <FormField name="role" label="직함">
        <TextInput placeholder="example" />
      </FormField>

      <Button glossy size="lg" type="submit">완료</Button>
    </FormProvider>
  </div>
</div>
