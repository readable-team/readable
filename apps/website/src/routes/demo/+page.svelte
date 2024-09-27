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
      빠른 팀을 위한 문서 이전 서비스
    </h1>

    <p class={css({ textStyle: { base: '13m', lg: '22m' }, color: 'text.tertiary', textAlign: 'center' })}>
      기존 문서가 리더블에서는 어떻게 보일지 궁금하신가요?
      <br />
      문서 주소만 보내주시면 24시간 내에 리더블로 옮겨드려요
    </p>

    <FormProvider class={flex({ direction: 'column', gap: '16px', marginTop: '80px' })} {context} {form}>
      <FormField name="url" label="문서 주소">
        <TextInput placeholder="https://docs.company.com" />
      </FormField>
      <FormField name="name" label="받아보실 이메일">
        <TextInput placeholder="company@example.com" />
      </FormField>

      <Button glossy size="lg" type="submit">신청하기</Button>
    </FormProvider>
  </div>
</div>
