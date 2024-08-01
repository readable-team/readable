<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Button, Icon, Modal, TextInput } from '@readable/ui/components';
  import BadgeCentIcon from '~icons/lucide/badge-cent';
  import PaintbrushIcon from '~icons/lucide/paintbrush';
  import ReceiptCentIcon from '~icons/lucide/receipt-cent';
  import SatelliteDishIcon from '~icons/lucide/satellite-dish';
  import UsersIcon from '~icons/lucide/users';
  import { goto } from '$app/navigation';
  import { fragment, graphql } from '$graphql';
  import Img from '$lib/components/Img.svelte';
  import type { SettingModal_site, SettingModal_user, SettingModal_workspace } from '$graphql';

  let _user: SettingModal_user;
  let _workspace: SettingModal_workspace;
  let _site: SettingModal_site;
  export { _site as $site, _user as $user, _workspace as $workspace };

  export let open = false;

  $: user = fragment(
    _user,
    graphql(`
      fragment SettingModal_user on User {
        id
        name
        email
        avatarUrl
      }
    `),
  );

  $: workspace = fragment(
    _workspace,
    graphql(`
      fragment SettingModal_workspace on Workspace {
        id

        meAsMember {
          id
          role
        }

        members {
          id
          role

          user {
            id
            email
          }
        }
      }
    `),
  );

  $: site = fragment(
    _site,
    graphql(`
      fragment SettingModal_site on Site {
        id
        name
        url
      }
    `),
  );

  const inviteWorkspaceMember = graphql(`
    mutation SettingModal_InviteWorkspaceMember_Mutation($input: InviteWorkspaceMemberInput!) {
      inviteWorkspaceMember(input: $input) {
        ... on WorkspaceMember {
          id
        }

        ... on WorkspaceMemberInvitation {
          id
          email
          createdAt
        }
      }
    }
  `);

  const updateWorkspaceMemberRole = graphql(`
    mutation SettingModal_UpdateWorkspaceMemberRole_Mutation($input: UpdateWorkspaceMemberRoleInput!) {
      updateWorkspaceMemberRole(input: $input) {
        id
        role
      }
    }
  `);

  const removeWorkspaceMember = graphql(`
    mutation SettingModal_RemoveWorkspaceMember_Mutation($input: RemoveWorkspaceMemberInput!) {
      removeWorkspaceMember(input: $input) {
        id
      }
    }
  `);

  const deleteSite = graphql(`
    mutation SettingModal_DeleteSite_Mutation($input: DeleteSiteInput!) {
      deleteSite(input: $input) {
        id
      }
    }
  `);

  let selectedTabIndex = 0;
  let inviteMemberEmail = '';

  const siteSettings = [
    {
      icon: SatelliteDishIcon,
      text: '기본정보',
      tabIndex: 0,
    },
    {
      icon: PaintbrushIcon,
      text: '디자인',
      tabIndex: 1,
    },
  ];

  const workspaceSettings = [
    {
      icon: UsersIcon,
      text: '멤버 관리',
      tabIndex: 2,
    },
    {
      icon: BadgeCentIcon,
      text: '요금제 변경',
      tabIndex: 3,
    },
    {
      icon: ReceiptCentIcon,
      text: '청구',
      tabIndex: 4,
    },
  ];

  const tabItemStyle = flex({
    align: 'center',
    gap: '6px',
    borderRadius: '6px',
    paddingX: '6px',
    paddingY: '5px',
    textStyle: '15sb',
    color: 'text.secondary',
    width: 'full',
    _hover: { backgroundColor: 'neutral.20' },
    _pressed: { backgroundColor: 'neutral.20' },
  });
</script>

<Modal style={css.raw({ display: 'flex' })} bind:open>
  <div
    class={flex({
      direction: 'column',
      gap: '16px',
      borderTopLeftRadius: '16px',
      borderBottomLeftRadius: '16px',
      paddingX: '16px',
      paddingY: '32px',
      backgroundColor: 'sidebar.surface',
      width: '240px',
      overflowY: 'auto',
    })}
  >
    <div class={flex({ align: 'center', gap: '6px' })}>
      <Img
        style={css.raw({
          flex: 'none',
          borderWidth: '1px',
          borderColor: 'border.image',
          borderRadius: 'full',
          size: '36px',
        })}
        alt={`${$user.name}의 아바타`}
        url={$user.avatarUrl}
      />

      <div class={css({ truncate: true })}>
        <p class={css({ textStyle: '14b', truncate: true })}>{$user.name}</p>
        <p class={css({ textStyle: '13m', color: 'text.tertiary', truncate: true })}>{$user.email}</p>
      </div>
    </div>

    <dl class={flex({ direction: 'column', gap: '4px', paddingTop: '16px', paddingBottom: '8px' })}>
      <dt class={css({ textStyle: '12sb', color: 'text.tertiary' })}>사이트 설정</dt>
      {#each siteSettings as setting (setting.text)}
        <dd>
          <button
            class={tabItemStyle}
            aria-pressed={selectedTabIndex === setting.tabIndex}
            type="button"
            on:click={() => (selectedTabIndex = setting.tabIndex)}
          >
            <Icon icon={setting.icon} />
            <span>{setting.text}</span>
          </button>
        </dd>
      {/each}
    </dl>

    <dl class={flex({ direction: 'column', gap: '4px', paddingTop: '16px', paddingBottom: '8px' })}>
      <dt class={css({ textStyle: '12sb', color: 'text.tertiary' })}>워크스페이스</dt>
      {#each workspaceSettings as setting (setting.text)}
        <dd>
          <button
            class={tabItemStyle}
            aria-pressed={selectedTabIndex === setting.tabIndex}
            type="button"
            on:click={() => (selectedTabIndex = setting.tabIndex)}
          >
            <Icon icon={setting.icon} />
            <span>{setting.text}</span>
          </button>
        </dd>
      {/each}
    </dl>
  </div>

  <div class={css({ flexGrow: '1', padding: '32px', overflowY: 'auto' })}>
    <div hidden={selectedTabIndex != 0}>
      <h1>기본정보 설정</h1>
      <Button
        on:click={async () => {
          await deleteSite({ siteId: $site.id });
          await goto(`/workspace/${$workspace.id}`);
        }}
      >
        사이트 삭제
      </Button>
    </div>
    <div hidden={selectedTabIndex != 1}>디자인 설정</div>
    <div hidden={selectedTabIndex != 2}>
      <!-- todo: form validation -->
      <form
        class={flex({ align: 'center', gap: '10px' })}
        on:submit|preventDefault={async () => {
          await inviteWorkspaceMember({
            workspaceId: $workspace.id,
            email: inviteMemberEmail,
          });
          inviteMemberEmail = '';
        }}
      >
        <TextInput name="email" placeholder="이메일" bind:value={inviteMemberEmail} />
        <Button size="lg" type="submit">멤버 초대</Button>
      </form>

      <br />
      <br />

      <ul>
        {#each $workspace.members as member (member.id)}
          <li class={flex({ align: 'center', gap: '10px' })}>
            <div>
              <p>{member.user.email}</p>
              <p>{member.role}</p>
            </div>

            {#if $workspace.meAsMember?.role === 'ADMIN' && member.id !== $workspace.meAsMember?.id}
              <Button
                size="sm"
                variant="secondary"
                on:click={async () =>
                  await updateWorkspaceMemberRole({
                    role: 'ADMIN',
                    userId: member.user.id,
                    workspaceId: $workspace.id,
                  })}
              >
                ADMIN으로 변경
              </Button>
              <Button
                size="sm"
                variant="secondary"
                on:click={async () =>
                  await updateWorkspaceMemberRole({
                    role: 'MEMBER',
                    userId: member.user.id,
                    workspaceId: $workspace.id,
                  })}
              >
                MEMBER로 변경
              </Button>
            {/if}

            {#if $workspace.meAsMember?.role === 'ADMIN' || member.id === $workspace.meAsMember?.id}
              <Button
                size="sm"
                on:click={async () => {
                  // TODO: alert, cache invalidate
                  await removeWorkspaceMember({ userId: member.user.id, workspaceId: $workspace.id });
                  if (member.id === $workspace.meAsMember?.id) {
                    await goto('/');
                  }
                }}
              >
                탈퇴
              </Button>
            {/if}
          </li>
        {/each}
      </ul>
    </div>
    <div hidden={selectedTabIndex != 3}>요금제 변경</div>
    <div hidden={selectedTabIndex != 4}>청구</div>
  </div>
</Modal>
