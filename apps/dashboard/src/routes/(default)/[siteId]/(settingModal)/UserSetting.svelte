<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Button, FormField, TextInput } from '@readable/ui/components';
  import { createMutationForm } from '@readable/ui/forms';
  import { z } from 'zod';
  import { dataSchemas } from '@/schemas';
  import { fragment, graphql } from '$graphql';
  import { Img } from '$lib/components';
  import { uploadBlobAsImage } from '$lib/utils/blob.svelte';
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
          ...Img_image
        }
      }
    `),
  );

  const updateUser = graphql(`
    mutation UserSetting_UpdateUser_Mutation($input: UpdateUserInput!) {
      updateUser(input: $input) {
        id
        avatar {
          id
          ...Img_image
        }
        name
      }
    }
  `);

  const { form, data, setInitialValues, isDirty, isSubmitting, reset, setIsDirty } = createMutationForm({
    schema: z.object({
      avatarId: z.string(),
      avatarDraftFile: z.any(),
      name: dataSchemas.user.name,
    }),
    mutation: async (fields) => {
      let { avatarId, name, avatarDraftFile } = fields;

      if (avatarDraftFile) {
        const avatar = await uploadBlobAsImage(avatarDraftFile, {
          ensureAlpha: true,
          resize: { width: 512, height: 512, fit: 'contain', background: '#00000000' },
          format: 'png',
        });
        avatarId = avatar.id;
      }

      return await updateUser({
        avatarId,
        name,
      });
    },
    onSuccess: (result) => {
      console.log('success', result);
      setIsDirty(false);
    },
    onError: (error) => {
      console.log(error);
    },
  });

  $: if ($user) {
    setInitialValues({ avatarId: $user.avatar.id, name: $user.name });
  }
</script>

<h1>내 계정</h1>

<br />
<br />
<h2>이메일</h2>
<p>{$user.email}</p>
<br />
<br />

<form use:form>
  <input name="avatarId" type="hidden" />
  <FormField name="avatar">
    {#if $data.avatarDraftFile}
      <img
        class={css({ size: '64px', borderWidth: '1px', borderColor: 'border.image', borderRadius: 'full' })}
        alt="아바타"
        src={URL.createObjectURL($data.avatarDraftFile)}
      />
    {:else}
      <Img
        style={css.raw({ size: '64px', borderWidth: '1px', borderColor: 'border.image', borderRadius: 'full' })}
        $image={$user.avatar}
        alt="아바타"
        size={64}
      />
    {/if}
    <input name="avatarDraftFile" type="file" />
  </FormField>
  <FormField name="name">
    <TextInput name="name" placeholder="이름" />
  </FormField>

  <div class={flex()}>
    {#if $isDirty}
      <Button size="lg" type="button" variant="secondary" on:click={reset}>되돌리기</Button>
    {/if}
    <Button disabled={!$isDirty || $isSubmitting} loading={$isSubmitting} size="lg" type="submit">저장</Button>
  </div>
</form>
