<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import {
    Button,
    FormField,
    HorizontalDivider,
    Icon,
    Menu,
    MenuItem,
    Modal,
    TextInput,
  } from '@readable/ui/components';
  import { createMutationForm } from '@readable/ui/forms';
  import { z } from 'zod';
  import { dataSchemas } from '@/schemas';
  import CheckIcon from '~icons/lucide/check';
  import ChevronDownIcon from '~icons/lucide/chevron-down';
  import EllipsisIcon from '~icons/lucide/ellipsis';
  import UserRoundMinusIcon from '~icons/lucide/user-round-minus';
  import XIcon from '~icons/lucide/x';
  import { goto, invalidateAll } from '$app/navigation';
  import { fragment, graphql } from '$graphql';
  import Img from '$lib/components/Img.svelte';
  import { invokeAlert } from '$lib/components/invoke-alert';
  import type { TeamMembers_team } from '$graphql';

  let _team: TeamMembers_team;

  export { _team as $team };

  $: team = fragment(
    _team,
    graphql(`
      fragment TeamMembers_team on Team {
        id
        name
        avatar {
          id
          ...Img_image
        }
        meAsMember {
          id
          role
        }

        members {
          id
          role
          isSoleAdmin

          user {
            id
            email
            name

            avatar {
              id
              ...Img_image
            }
          }
        }
      }
    `),
  );

  const { form, reset, setErrors } = createMutationForm({
    mutation: graphql(`
      mutation UserSettingModal_InviteTeamMember_Mutation($input: InviteTeamMemberInput!) {
        inviteTeamMember(input: $input) {
          ... on TeamMember {
            id
          }

          ... on TeamMemberInvitation {
            id
            email
            createdAt
          }
        }
      }
    `),
    schema: z.object({
      teamId: dataSchemas.team.id,
      email: dataSchemas.email,
    }),
    onSuccess: () => {
      reset();
    },
    onError: (e: unknown) => {
      if (e instanceof Error) {
        setErrors({ email: '알 수 없는 오류가 발생했습니다.' });
      } else {
        // GraphQL 에러
        setErrors({ email: (e as { message: string }).message });
      }
    },
  });

  const updateTeamMemberRole = graphql(`
    mutation UserSettingModal_UpdateTeamMemberRole_Mutation($input: UpdateTeamMemberRoleInput!) {
      updateTeamMemberRole(input: $input) {
        id
        role
      }
    }
  `);

  const removeTeamMember = graphql(`
    mutation UserSettingModal_RemoveTeamMember_Mutation($input: RemoveTeamMemberInput!) {
      removeTeamMember(input: $input) {
        id
      }
    }
  `);

  let isInviteModalOpen = false;
</script>

<div class={flex({ justifyContent: 'space-between', alignItems: 'center' })}>
  <h1 class={css({ textStyle: '28eb' })}>멤버 관리</h1>
  <Button size="sm" type="button" on:click={() => (isInviteModalOpen = true)}>멤버 초대</Button>
</div>

<HorizontalDivider style={css.raw({ marginTop: '20px' })} />

<div class={flex({ flexDirection: 'column', paddingY: '40px', gap: '16px' })}>
  <div class={css({ textStyle: '16m', color: 'text.tertiary' })}>
    {$team.members.length}명의 멤버
  </div>

  <ul class={flex({ flexDirection: 'column', gap: '12px' })}>
    {#each $team.members as member (member.id)}
      <li class={flex({ alignItems: 'center', gap: '16px' })}>
        <div class={flex({ flex: '1', alignItems: 'center', gap: '8px', truncate: true })}>
          <Img
            style={css.raw({
              borderWidth: '1px',
              borderColor: 'border.image',
              borderRadius: 'full',
              size: '32px',
            })}
            $image={member.user.avatar}
            alt={`${member.user.name}의 아바타`}
            size={32}
          />
          <div class={flex({ flexDirection: 'column', truncate: true })}>
            <p class={css({ textStyle: '16sb', color: 'text.secondary', truncate: true })}>{member.user.name}</p>
            <p class={css({ textStyle: '16m', color: 'text.tertiary', truncate: true })}>{member.user.email}</p>
          </div>
        </div>

        <div class={css({ flexShrink: 0, padding: '16px' })}>
          {#if $team.meAsMember?.role === 'ADMIN'}
            <Menu listStyle={css.raw({ gap: '1px' })} offset={2} placement="bottom-start">
              <div
                slot="button"
                class={flex({
                  width: '86px',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingX: '8px',
                  paddingY: '4px',
                  textStyle: '14sb',
                  color: 'text.secondary',
                  borderRadius: '4px',
                  _hover: {
                    backgroundColor: 'neutral.20',
                  },
                })}
              >
                <span>{member.role === 'ADMIN' ? '관리자' : '멤버'}</span>
                <Icon style={css.raw({ color: 'neutral.60' })} icon={ChevronDownIcon} size={16} />
              </div>

              <button
                class={flex({
                  width: '260px',
                  gap: '20px',
                  paddingY: '10px',
                  paddingX: '12px',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  _hover: {
                    backgroundColor: 'neutral.20',
                  },
                  _checked: {
                    backgroundColor: 'neutral.20',
                  },
                })}
                aria-checked={member.role === 'ADMIN'}
                role="menuitemradio"
                type="button"
                on:click={async () =>
                  await updateTeamMemberRole({
                    role: 'ADMIN',
                    userId: member.user.id,
                    teamId: $team.id,
                  })}
              >
                <div class={flex({ flexDirection: 'column', alignItems: 'start', gap: '2px' })}>
                  <p class={css({ textStyle: '15sb', color: 'text.primary' })}>관리자</p>
                  <p class={css({ textStyle: '13m', color: 'text.tertiary' })}>사이트 설정 변경, 멤버 초대 및 관리</p>
                </div>
                {#if member.role === 'ADMIN'}
                  <Icon style={css.raw({ color: 'accent.60' })} icon={CheckIcon} size={16} />
                {/if}
              </button>
              <button
                class={flex({
                  width: '260px',
                  gap: '20px',
                  paddingY: '10px',
                  paddingX: '12px',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  _enabled: {
                    _hover: {
                      backgroundColor: 'neutral.20',
                    },
                    _checked: {
                      backgroundColor: 'neutral.20',
                    },
                  },
                  _disabled: {
                    '& p': {
                      color: 'text.disabled',
                    },
                  },
                })}
                aria-checked={member.role === 'MEMBER'}
                disabled={member.role === 'ADMIN' && member.isSoleAdmin}
                role="menuitemradio"
                type="button"
                on:click={async () =>
                  await updateTeamMemberRole({
                    role: 'MEMBER',
                    userId: member.user.id,
                    teamId: $team.id,
                  })}
              >
                <div class={flex({ flexDirection: 'column', alignItems: 'start', gap: '2px' })}>
                  <p class={css({ textStyle: '15sb', color: 'text.primary' })}>멤버</p>
                  <p class={css({ textStyle: '13m', color: 'text.tertiary' })}>사이트 설정 변경</p>
                </div>
                {#if member.role === 'MEMBER'}
                  <Icon style={css.raw({ color: 'accent.60' })} icon={CheckIcon} size={16} />
                {/if}
              </button>
            </Menu>
          {:else}
            <div
              class={flex({
                width: '86px',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingX: '8px',
                paddingY: '4px',
                textStyle: '14sb',
                color: 'text.secondary',
              })}
            >
              {member.role === 'ADMIN' ? '관리자' : '멤버'}
            </div>
          {/if}
        </div>

        <div class={flex({ width: '60px', justifyContent: 'center', alignItems: 'center' })}>
          {#if member.id === $team.meAsMember?.id && !member.isSoleAdmin}
            <Menu offset={2} placement="bottom-start">
              <div
                slot="button"
                class={flex({
                  padding: '4px',
                  color: 'text.secondary',
                  _hover: {
                    backgroundColor: 'neutral.20',
                  },
                })}
              >
                <Icon icon={EllipsisIcon} size={14} />
              </div>
              <MenuItem
                variant="danger"
                on:click={async () => {
                  invokeAlert({
                    title: `"${$team.name}" 팀에서 떠나시겠어요?`,
                    content: '팀에서 떠나게 될 시 팀에 접근할 수 없으며, 관련 권한이 모두 해제됩니다',
                    actionText: '떠나기',
                    action: async () => {
                      // TODO: alert, cache invalidate
                      await removeTeamMember({ userId: member.user.id, teamId: $team.id });
                      if (member.id === $team.meAsMember?.id) {
                        await invalidateAll();
                        await goto('/');
                      }
                    },
                  });
                }}
              >
                <Icon slot="prefix" icon={UserRoundMinusIcon} size={14} />
                <span>팀 떠나기</span>
              </MenuItem>
            </Menu>
          {:else if $team.meAsMember?.role === 'ADMIN' && !(member.id === $team.meAsMember?.id && member.isSoleAdmin)}
            <Menu offset={2} placement="bottom-start">
              <div
                slot="button"
                class={flex({
                  padding: '4px',
                  color: 'text.secondary',
                  _hover: {
                    backgroundColor: 'neutral.20',
                  },
                })}
              >
                <Icon icon={EllipsisIcon} size={14} />
              </div>
              <MenuItem
                variant="danger"
                on:click={async () => {
                  invokeAlert({
                    title: `"${member.user.name}"을 팀 멤버에서 제거하시겠어요?`,
                    content: '제거된 멤버는 팀 리소스에 접근할 수 없게 되며, 관련 권한이 모두 해제됩니다 ',
                    actionText: '제거',
                    action: async () => {
                      // TODO: alert, cache invalidate
                      await removeTeamMember({ userId: member.user.id, teamId: $team.id });
                    },
                  });
                }}
              >
                <Icon slot="prefix" icon={UserRoundMinusIcon} size={14} />
                <span>멤버 제거</span>
              </MenuItem>
            </Menu>
          {/if}
        </div>
      </li>
    {/each}
  </ul>
</div>

<Modal style={css.raw({ width: '600px' })} close={() => (isInviteModalOpen = false)} bind:open={isInviteModalOpen}>
  <div
    class={flex({
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingX: '32px',
      paddingY: '20px',
      borderBottomWidth: '1px',
      borderColor: 'border.secondary',
    })}
  >
    <div class={flex({ alignItems: 'center', gap: '8px' })}>
      <Img
        style={css.raw({
          borderWidth: '1px',
          borderColor: 'border.image',
          borderRadius: 'full',
          size: '20px',
        })}
        $image={$team.avatar}
        alt={`${$team.name}의 아바타`}
        size={24}
      />
      <h2 class={css({ textStyle: '16sb' })}>멤버 초대</h2>
    </div>
    <button type="button" on:click={() => (isInviteModalOpen = false)}>
      <Icon icon={XIcon} size={20} />
    </button>
  </div>
  <form class={flex({ flexDirection: 'column', gap: '16px', paddingX: '32px', paddingY: '24px' })} use:form>
    <input name="teamId" type="hidden" value={$team.id} />
    <FormField name="email" label="이메일">
      <TextInput placeholder="초대할 이메일을 입력해주세요 (email@example.com...)" />
    </FormField>
    <div class={flex({ justifyContent: 'flex-end' })}>
      <Button size="md" type="submit">초대하기</Button>
    </div>
  </form>
</Modal>
