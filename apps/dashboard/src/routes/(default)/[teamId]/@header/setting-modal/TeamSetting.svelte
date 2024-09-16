<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Button, FormField, HorizontalDivider, Icon, TextInput } from '@readable/ui/components';
  import { createMutationForm } from '@readable/ui/forms';
  import { toast } from '@readable/ui/notification';
  import mixpanel from 'mixpanel-browser';
  import { z } from 'zod';
  import { dataSchemas } from '@/schemas';
  import TriangleAlertIcon from '~icons/lucide/triangle-alert';
  import { goto } from '$app/navigation';
  import { fragment, graphql } from '$graphql';
  import { TitledModal } from '$lib/components';
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

        sites {
          id
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

  const deleteTeam = graphql(`
    mutation TeamSetting_DeleteTeam_Mutation($input: DeleteTeamInput!) {
      deleteTeam(input: $input) {
        id
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

  let deleteTeamOpen = false;

  const { form: deleteForm, data: deleteFormData } = createMutationForm({
    schema: z.object({
      teamId: z.string(),
      teamName: z.string(),
    }),
    mutation: async ({ teamId }) => {
      await deleteTeam({ teamId });
      mixpanel.track('team:delete');
      await goto('/');
    },
  });
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

<div class={css({ marginY: '40px', height: '1px', backgroundColor: 'border.primary' })} />

<div class={css({ textStyle: '14sb', color: 'text.danger' })}>팀 삭제</div>
<div class={css({ marginTop: '6px', textStyle: '14r', color: 'text.tertiary' })}>
  {#if $team.sites.length > 0}
    사이트 삭제 후 팀 삭제가 가능합니다.
    <br />
    사이트 삭제는 [사이트 설정] - [일반] 메뉴에서 할 수 있습니다
  {:else}
    팀 삭제 시 모든 멤버 및 관리자 정보가 영구적으로 제거되며, 되돌릴 수 없습니다.
  {/if}
</div>

<Button
  style={css.raw({ marginTop: '8px', marginLeft: 'auto' })}
  disabled={$team.sites.length > 0}
  size="lg"
  variant="danger-fill"
  on:click={() => {
    deleteTeamOpen = true;
  }}
>
  삭제
</Button>

<TitledModal bind:open={deleteTeamOpen}>
  <svelte:fragment slot="title">팀 삭제</svelte:fragment>

  <p
    class={css({
      color: 'text.tertiary',
      textStyle: '13r',
    })}
  >
    팀 삭제 시 모든 멤버 및 관리자 정보가 영구적으로 제거되며, 되돌릴 수 없습니다.
    <br />
    삭제를 진행하시려면 아래 팀 이름을 입력해 주세요.
  </p>

  <div
    class={flex({
      'align': 'center',
      'gap': '6px',
      'marginTop': '10px',
      'borderRadius': '8px',
      'paddingX': '10px',
      'paddingY': '8px',
      'textStyle': '13m',
      'color': 'text.danger',
      'backgroundColor': 'danger.10',
      '& b': {
        textStyle: '13b',
      },
    })}
  >
    <Icon icon={TriangleAlertIcon} />
    <p>
      삭제를 진행하시려면 아래에 다음 문구를 입력해주세요:
      <b>{$team.name}</b>
    </p>
  </div>

  <form use:deleteForm>
    <input name="teamId" type="hidden" value={$team.id} />

    <FormField name="teamName" style={css.raw({ marginTop: '20px' })} label="팀 이름">
      <TextInput name="teamName" placeholder={$team.name} />
    </FormField>

    <Button
      style={css.raw({ width: 'full', marginTop: '20px' })}
      disabled={$deleteFormData.teamName !== $team.name}
      size="lg"
      type="submit"
      variant="danger-fill"
    >
      삭제
    </Button>
  </form>
</TitledModal>
