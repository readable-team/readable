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
      빠른 팀을 위한 문서 이전 서비스
    </h1>

    <p class={css({ textStyle: { base: '13m', lg: '22m' }, color: 'text.tertiary', textAlign: 'center' })}>
      기존 문서를 일일이 작성할 필요 없이 저희가 자동으로 옮겨드립니다.
      <br />
      빠른 팀을 위한 스마트한 문서화, 리더블에서 경험해보세요.
    </p>

    <FormProvider class={flex({ direction: 'column', gap: '16px', marginTop: '80px' })} {context} {form}>
      <FormField name="name" label="회사 이메일">
        <TextInput placeholder="company@example.com" />
      </FormField>
      <FormField name="url" label="문서 주소">
        <TextInput placeholder="https://docs.company.com" />
      </FormField>

      <Button glossy size="lg" type="submit">완료</Button>
    </FormProvider>
  </div>
</div>
