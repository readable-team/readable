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
  import type { TeamSetting_team } from '$graphql';

  let _team: TeamSetting_team;

  export { _team as $team };

  $: team = fragment(
    _team,
    graphql(`
      fragment TeamSetting_team on Team {
        id
        name

        avatar {
          id
          ...Img_image
        }
      }
    `),
  );

  const updateTeam = graphql(`
    mutation TeamSetting_UpdateTeam_Mutation($input: UpdateTeamInput!) {
      updateTeam(input: $input) {
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
      teamId: z.string(),
      avatarId: z.string(),
      avatarDraftFile: z.any(),
      name: dataSchemas.team.name,
    }),
    mutation: async (fields) => {
      let { avatarId, avatarDraftFile, ...rest } = fields;

      if (avatarDraftFile) {
        const avatar = await uploadBlobAsImage(avatarDraftFile, {
          ensureAlpha: true,
          resize: { width: 512, height: 512, fit: 'contain', background: '#00000000' },
          format: 'png',
        });
        avatarId = avatar.id;
      }

      return await updateTeam({
        avatarId,
        ...rest,
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

  $: if ($team) {
    setInitialValues({ avatarId: $team.avatar.id, name: $team.name, teamId: $team.id });
  }
</script>

<h1>팀 관리</h1>

<br />
<br />

<form use:form>
  <input name="teamId" type="hidden" />
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
        $image={$team.avatar}
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
