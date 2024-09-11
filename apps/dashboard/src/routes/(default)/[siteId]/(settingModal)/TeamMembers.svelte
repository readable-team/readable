<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { center, flex } from '@readable/styled-system/patterns';
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
  import { toast } from '@readable/ui/notification';
  import { GraphQLError } from 'graphql';
  import mixpanel from 'mixpanel-browser';
  import { z } from 'zod';
  import { dataSchemas } from '@/schemas';
  import CheckIcon from '~icons/lucide/check';
  import ChevronDownIcon from '~icons/lucide/chevron-down';
  import EllipsisIcon from '~icons/lucide/ellipsis';
  import MailOpenIcon from '~icons/lucide/mail-open';
  import UserRoundMinusIcon from '~icons/lucide/user-round-minus';
  import UserXIcon from '~icons/lucide/user-x';
  import XIcon from '~icons/lucide/x';
  import { goto, invalidateAll } from '$app/navigation';
  import { fragment, graphql } from '$graphql';
  import Img from '$lib/components/Img.svelte';
  import { invokeAlert } from '$lib/components/invoke-alert';
  import type { TeamMembers_team } from '$graphql';

  let isInviteModalOpen = false;

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

        invitations {
          id
          email
        }
      }
    `),
  );

  const { form, reset, setErrors } = createMutationForm({
    mutation: graphql(`
      mutation TeamMembers_InviteTeamMember_Mutation($input: InviteTeamMemberInput!) {
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
      toast.success('초대 이메일이 발송되었습니다');
      reset();

      mixpanel.track('team:member:invitation:send');
    },
    onError: (e: unknown) => {
      if (e instanceof GraphQLError) {
        // FIXME: unexpected error
        setErrors({ email: e.message });
      } else {
        setErrors({ email: '알 수 없는 오류가 발생했습니다.' });
      }
    },
  });

  const resendInvitationEmail = graphql(`
    mutation TeamMembers_ResendInvitationEmail_Mutation($input: ResendInvitationEmailInput!) {
      resendInvitationEmail(input: $input) {
        id
      }
    }
  `);

  const revokeInvitation = graphql(`
    mutation TeamMembers_RevokeInvitation_Mutation($input: RevokeInvitationInput!) {
      revokeInvitation(input: $input) {
        id
      }
    }
  `);

  const updateTeamMemberRole = graphql(`
    mutation TeamMembers_UpdateTeamMemberRole_Mutation($input: UpdateTeamMemberRoleInput!) {
      updateTeamMemberRole(input: $input) {
        id
        role
      }
    }
  `);

  const removeTeamMember = graphql(`
    mutation TeamMembers_RemoveTeamMember_Mutation($input: RemoveTeamMemberInput!) {
      removeTeamMember(input: $input) {
        id
      }
    }
  `);
</script>

<div class={flex({ justifyContent: 'space-between', alignItems: 'center' })}>
  <h1 class={css({ textStyle: '28eb' })}>멤버 관리</h1>

  {#if $team.meAsMember?.role === 'ADMIN'}
    <Button size="sm" type="button" on:click={() => (isInviteModalOpen = true)}>멤버 초대</Button>
  {/if}
</div>

<HorizontalDivider style={css.raw({ marginTop: '20px' })} />

<div class={flex({ flexDirection: 'column', paddingY: '40px', gap: '16px' })}>
  <div class={css({ textStyle: '14sb', color: 'text.secondary' })}>
    {$team.members.length}명의 멤버
  </div>

  <ul class={flex({ flexDirection: 'column', gap: '12px' })}>
    {#each $team.invitations as invitation (invitation.id)}
      <li class={flex({ alignItems: 'center', gap: '16px' })}>
        <div class={flex({ align: 'center', gap: '8px', grow: 1 })}>
          <div
            class={center({
              borderWidth: '1px',
              borderColor: 'border.image',
              borderRadius: 'full',
              borderStyle: 'dashed',
              textStyle: '16b',
              color: 'neutral.40',
              size: '32px',
            })}
          >
            {invitation.email[0].toUpperCase()}
          </div>

          <p class={css({ textStyle: '14r', color: 'text.tertiary' })}>{invitation.email}</p>
        </div>

        <div class={css({ padding: '16px' })}>
          <p
            class={css({
              paddingX: '8px',
              paddingY: '4px',
              textStyle: '16m',
              color: 'text.secondary',
              width: '86px',
            })}
          >
            <span>초대중</span>
          </p>
        </div>

        <div class={flex({ width: '60px', justifyContent: 'center', alignItems: 'center' })}>
          <Menu listStyle={css.raw({ gap: '1px' })} offset={2} placement="bottom-start">
            <div
              slot="button"
              class={css({
                borderRadius: '6px',
                padding: '4px',
                color: 'text.secondary',
                _hover: {
                  backgroundColor: 'neutral.20',
                },
              })}
            >
              <Icon icon={EllipsisIcon} size={16} />
            </div>

            <MenuItem
              on:click={async () => {
                await resendInvitationEmail({ invitationId: invitation.id });
                toast.success('초대 이메일이 재발송되었습니다');

                mixpanel.track('team:member:invitation:resend');
              }}
            >
              <Icon icon={MailOpenIcon} size={14} />
              <span>이메일 재발송</span>
            </MenuItem>
            <MenuItem
              variant="danger"
              on:click={async () => {
                invokeAlert({
                  title: '초대를 취소하시겠어요?',
                  content: '발송된 초대 이메일에 포함된 링크는 더 이상 작동하지 않습니다',
                  actionText: '발송 취소',
                  action: async () => {
                    await revokeInvitation({ invitationId: invitation.id });

                    mixpanel.track('team:member:invitation:revoke');
                  },
                });
              }}
            >
              <Icon icon={UserXIcon} size={14} />
              <span>초대 취소</span>
            </MenuItem>
          </Menu>
        </div>
      </li>
    {/each}

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
            <p class={css({ textStyle: '16m', color: 'text.secondary', truncate: true })}>{member.user.name}</p>
            <p class={css({ textStyle: '14r', color: 'text.tertiary', truncate: true })}>{member.user.email}</p>
          </div>
        </div>

        <div class={css({ flexShrink: 0, padding: '16px' })}>
          {#if $team.meAsMember?.role === 'ADMIN'}
            <Menu
              listStyle={css.raw({ borderRadius: '[18px]', paddingY: '8px', paddingX: '2px' })}
              offset={6}
              placement="bottom-start"
            >
              <div
                slot="button"
                class={flex({
                  width: '86px',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingX: '8px',
                  paddingY: '4px',
                  textStyle: '16m',
                  color: 'text.secondary',
                  borderRadius: '6px',
                  _hover: {
                    backgroundColor: 'neutral.20',
                  },
                })}
              >
                <span>{member.role === 'ADMIN' ? '관리자' : '편집자'}</span>
                <Icon style={css.raw({ color: 'neutral.60' })} icon={ChevronDownIcon} size={16} />
              </div>

              <MenuItem
                style={css.raw({ gap: '20px', borderRadius: '10px', paddingY: '10px' })}
                aria-checked={member.role === 'ADMIN'}
                on:click={async () => {
                  await updateTeamMemberRole({
                    role: 'ADMIN',
                    userId: member.user.id,
                    teamId: $team.id,
                  });

                  mixpanel.track('team:member:role:update', {
                    role: 'ADMIN',
                  });
                }}
              >
                <div class={flex({ flexDirection: 'column', alignItems: 'start', gap: '2px', width: 'full' })}>
                  <p class={css({ textStyle: '15sb', color: 'text.primary' })}>관리자</p>
                  <p class={css({ textStyle: '13r', color: 'text.tertiary' })}>
                    사이트 및 팀 설정 변경, 문서 편집, 발행 및 삭제
                  </p>
                </div>

                <Icon
                  style={css.raw(
                    { visibility: 'hidden', color: 'accent.60' },
                    member.role === 'ADMIN' && { visibility: 'visible' },
                  )}
                  icon={CheckIcon}
                  size={16}
                />
              </MenuItem>
              <MenuItem
                style={css.raw({
                  gap: '20px',
                  borderRadius: '10px',
                  paddingY: '10px',
                  _disabled: {
                    '& p': {
                      color: 'text.disabled',
                    },
                  },
                })}
                aria-checked={member.role === 'MEMBER'}
                disabled={member.role === 'ADMIN' && member.isSoleAdmin}
                on:click={async () => {
                  await updateTeamMemberRole({
                    role: 'MEMBER',
                    userId: member.user.id,
                    teamId: $team.id,
                  });

                  mixpanel.track('team:member:role:update', {
                    role: 'MEMBER',
                  });
                }}
              >
                <div class={flex({ flexDirection: 'column', alignItems: 'start', gap: '2px', width: 'full' })}>
                  <p class={css({ textStyle: '15sb', color: 'text.primary' })}>편집자</p>
                  <p class={css({ textStyle: '13r', color: 'text.tertiary' })}>문서 편집, 발행 및 삭제</p>
                </div>

                {#if member.role === 'MEMBER'}
                  <Icon style={css.raw({ color: 'accent.60' })} icon={CheckIcon} size={16} />
                {/if}
              </MenuItem>
            </Menu>
          {:else}
            <div
              class={css({
                paddingX: '8px',
                paddingY: '4px',
                textStyle: '14sb',
                color: 'text.secondary',
                width: '86px',
              })}
            >
              {member.role === 'ADMIN' ? '관리자' : '편집자'}
            </div>
          {/if}
        </div>

        <div class={flex({ width: '60px', justifyContent: 'center', alignItems: 'center' })}>
          {#if member.id === $team.meAsMember?.id && !member.isSoleAdmin}
            <Menu offset={2} placement="bottom-start">
              <div
                slot="button"
                class={flex({
                  borderRadius: '6px',
                  padding: '4px',
                  color: 'text.secondary',
                  _hover: {
                    backgroundColor: 'neutral.20',
                  },
                })}
              >
                <Icon icon={EllipsisIcon} size={20} />
              </div>
              <MenuItem
                variant="danger"
                on:click={async () => {
                  invokeAlert({
                    title: '팀에서 떠나시겠어요?',
                    content: '더 이상 팀 대시보드에 접근할 수 없습니다',
                    actionText: '떠나기',
                    action: async () => {
                      await removeTeamMember({ userId: member.user.id, teamId: $team.id });

                      mixpanel.track('team:member:remove:self');

                      if (member.id === $team.meAsMember?.id) {
                        await invalidateAll();
                        await goto('/');
                      }
                    },
                  });
                }}
              >
                <Icon slot="prefix" icon={UserRoundMinusIcon} size={14} />
                <span>팀에서 떠나기</span>
              </MenuItem>
            </Menu>
          {:else if $team.meAsMember?.role === 'ADMIN' && !(member.id === $team.meAsMember?.id && member.isSoleAdmin)}
            <Menu offset={2} placement="bottom-start">
              <div
                slot="button"
                class={flex({
                  borderRadius: '6px',
                  padding: '4px',
                  color: 'text.secondary',
                  _hover: {
                    backgroundColor: 'neutral.20',
                  },
                })}
              >
                <Icon icon={EllipsisIcon} size={20} />
              </div>
              <MenuItem
                variant="danger"
                on:click={async () => {
                  invokeAlert({
                    title: `"${member.user.name}"님을 팀에서 제거하시겠어요?`,
                    content: '제거된 멤버는 더 이상 팀 대시보드에 접근할 수 없습니다',
                    actionText: '제거',
                    action: async () => {
                      await removeTeamMember({ userId: member.user.id, teamId: $team.id });

                      mixpanel.track('team:member:remove');
                    },
                  });
                }}
              >
                <Icon slot="prefix" icon={UserRoundMinusIcon} size={14} />
                <span>팀에서 제거</span>
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
          size: '24px',
        })}
        $image={$team.avatar}
        alt={`${$team.name}의 아바타`}
        size={24}
      />
      <h2 class={css({ textStyle: '16b' })}>팀에 초대하기</h2>
    </div>
    <button type="button" on:click={() => (isInviteModalOpen = false)}>
      <Icon icon={XIcon} size={20} />
    </button>
  </div>

  <form class={flex({ flexDirection: 'column', gap: '16px', paddingX: '32px', paddingY: '24px' })} use:form>
    <input name="teamId" type="hidden" value={$team.id} />

    <FormField name="email" label="이메일">
      <TextInput placeholder="me@example.com" />
    </FormField>

    <Button style={css.raw({ marginLeft: 'auto' })} size="md" type="submit">초대하기</Button>
  </form>
</Modal>
