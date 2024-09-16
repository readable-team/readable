<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Button, FormField, HorizontalDivider, TextInput } from '@readable/ui/components';
  import { createMutationForm } from '@readable/ui/forms';
  import { toast } from '@readable/ui/notification';
  import mixpanel from 'mixpanel-browser';
  import { z } from 'zod';
  import { dataSchemas } from '@/schemas';
  import { fragment, graphql } from '$graphql';
  import AvatarInput from './AvatarInput.svelte';
  import type { UserSetting_user } from '$graphql';

  let _user: UserSetting_user;

  export { _user as $user };

  $: user = fragment(
    _user,
    graphql(`
      fragment UserSetting_user on User {
        id
        name
        email

        avatar {
          id
        }
      }
    `),
  );

  const { form, data, setInitialValues, isDirty, setIsDirty } = createMutationForm({
    schema: z.object({
      avatarId: z.string(),
      name: dataSchemas.user.name,
    }),
    mutation: graphql(`
      mutation UserSetting_UpdateUser_Mutation($input: UpdateUserInput!) {
        updateUser(input: $input) {
          id
          name

          avatar {
            id
          }
        }
      }
    `),
    onSuccess: () => {
      setIsDirty(false);
      toast.success('개인 설정이 변경되었습니다');

      mixpanel.track('user:update');
    },
    onError: (error) => {
      console.log(error);
    },
  });

  $: if ($user) {
    setInitialValues({ avatarId: $user.avatar.id, name: $user.name });
  }
</script>

<h1 class={css({ textStyle: '28eb' })}>개인 설정</h1>

<HorizontalDivider style={css.raw({ marginTop: '20px', marginBottom: '40px' })} />

<form use:form>
  <div class={flex({ flexDirection: 'column', gap: '24px' })}>
    <FormField name="avatar" label="이미지" noMessage>
      <AvatarInput bind:id={$data.avatarId} on:change={() => setIsDirty(true)} />
    </FormField>
    <FormField name="name" label="이름">
      <TextInput name="name" placeholder="이름" />
    </FormField>
    <FormField name="" description="이메일은 수정할 수 없어요" label="이메일">
      <TextInput disabled value={$user.email} />
    </FormField>
  </div>

  <div class={flex({ marginTop: '8px', gap: '8px', justify: 'flex-end' })}>
    {#if $isDirty}
      <Button size="lg" type="reset" variant="secondary">되돌리기</Button>
    {/if}
    <Button disabled={!$isDirty} size="lg" type="submit">변경</Button>
  </div>
</form>
