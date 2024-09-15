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
  import { uploadBlobAsImage } from '$lib/utils/blob.svelte';
  import AvatarInput from './AvatarInput.svelte';
  import type { TeamSetting_team } from '$graphql';

  let _team: TeamSetting_team;

  export { _team as $team };

  $: team = fragment(
    _team,
    graphql(`
      fragment TeamSetting_team on Team {
        id
        name

        meAsMember {
          id
          role
        }

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

  const { form, setInitialValues, isDirty, setIsDirty } = createMutationForm({
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
    onSuccess: () => {
      setIsDirty(false);
      toast.success('팀 설정이 변경되었습니다');

      mixpanel.track('team:update');
    },
    onError: (error) => {
      console.log(error);
    },
  });

  $: if ($team) {
    setInitialValues({ avatarId: $team.avatar.id, name: $team.name, teamId: $team.id });
  }
</script>

<h1 class={css({ textStyle: '28eb' })}>팀 설정</h1>

<HorizontalDivider style={css.raw({ marginTop: '20px', marginBottom: '40px' })} />

<form use:form>
  <input name="teamId" type="hidden" />
  <input name="avatarId" type="hidden" />

  <div class={flex({ flexDirection: 'column', gap: '24px' })}>
    <FormField name="avatar" label="팀 로고" noMessage>
      <AvatarInput name="avatarDraftFile" avatar={$team.avatar} canEdit={$team.meAsMember?.role !== 'MEMBER'} />
    </FormField>
    <FormField name="name" label="팀 이름">
      <TextInput name="name" disabled={$team.meAsMember?.role === 'MEMBER'} placeholder="ACME Inc." />
    </FormField>
  </div>

  <div class={flex({ marginTop: '8px', gap: '8px', justify: 'flex-end' })}>
    {#if $isDirty}
      <Button size="lg" type="reset" variant="secondary">되돌리기</Button>
    {/if}
    <Button disabled={!$isDirty} size="lg" type="submit">변경</Button>
  </div>
</form>
