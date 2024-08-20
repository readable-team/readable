<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Icon, Modal } from '@readable/ui/components';
  import BuildingIcon from '~icons/lucide/building';
  import CircleUserIcon from '~icons/lucide/circle-user';
  import UserCogIcon from '~icons/lucide/user-cog';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { fragment, graphql } from '$graphql';
  import { Img } from '$lib/components';
  import TeamMembers from './(settingModal)/TeamMembers.svelte';
  import TeamSetting from './(settingModal)/TeamSetting.svelte';
  import UserSetting from './(settingModal)/UserSetting.svelte';
  import type { UserSettingModal_site, UserSettingModal_user } from '$graphql';

  let _user: UserSettingModal_user;
  let _site: UserSettingModal_site;
  export { _site as $site, _user as $user };

  export let open = false;

  $: selectedTab = $page.url.hash;

  $: user = fragment(
    _user,
    graphql(`
      fragment UserSettingModal_user on User {
        id
        name
        email
        ...UserSetting_user

        avatar {
          id
          ...Img_image
        }
      }
    `),
  );

  $: site = fragment(
    _site,
    graphql(`
      fragment UserSettingModal_site on Site {
        id
        name
        url
        slug

        logo {
          id
          ...Img_image
        }

        team {
          id
          ...TeamSetting_team
          ...TeamMembers_team
        }
      }
    `),
  );

  const personalSettings = [
    {
      icon: CircleUserIcon,
      text: '내 계정',
      tab: '#/settings/personal',
    },
  ];

  const teamSettings = [
    {
      icon: BuildingIcon,
      text: '팀 관리',
      tab: '#/settings/team',
    },
    {
      icon: UserCogIcon,
      text: '멤버 관리',
      tab: '#/settings/team/members',
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
    _selected: { backgroundColor: 'neutral.30' },
  });
</script>

<Modal
  style={css.raw({ display: 'flex' })}
  close={() => {
    const currentPath = $page.url.pathname;
    goto(currentPath, { replaceState: true });
  }}
  bind:open
>
  <svelte:fragment slot="sidebar">
    <div class={flex({ align: 'center', gap: '6px' })}>
      <Img
        style={css.raw({
          flex: 'none',
          borderWidth: '1px',
          borderColor: 'border.image',
          borderRadius: 'full',
          size: '36px',
        })}
        $image={$user.avatar}
        alt={`${$user.name}의 아바타`}
        size={48}
      />

      <div class={css({ truncate: true })}>
        <p class={css({ textStyle: '14b', truncate: true })}>{$user.name}</p>
        <p class={css({ textStyle: '13m', color: 'text.tertiary', truncate: true })}>{$user.email}</p>
      </div>
    </div>

    <dl class={flex({ direction: 'column', gap: '4px', paddingTop: '16px', paddingBottom: '8px' })}>
      <dt class={css({ textStyle: '12sb', color: 'text.tertiary' })}>팀 설정</dt>
      {#each teamSettings as setting (setting.text)}
        <dd>
          <a class={tabItemStyle} aria-selected={selectedTab === setting.tab} href={setting.tab} role="tab">
            <Icon icon={setting.icon} />
            <span>{setting.text}</span>
          </a>
        </dd>
      {/each}
    </dl>

    <dl class={flex({ direction: 'column', gap: '4px', paddingTop: '16px', paddingBottom: '8px' })}>
      <dt class={css({ textStyle: '12sb', color: 'text.tertiary' })}>개인 설정</dt>
      {#each personalSettings as setting (setting.text)}
        <dd>
          <a class={tabItemStyle} aria-selected={selectedTab === setting.tab} href={setting.tab} role="tab">
            <Icon icon={setting.icon} />
            <span>{setting.text}</span>
          </a>
        </dd>
      {/each}
    </dl>
  </svelte:fragment>

  {#if selectedTab === '#/settings/team'}
    <TeamSetting $team={$site.team} />
  {:else if selectedTab === '#/settings/team/members'}
    <TeamMembers $team={$site.team} />
  {:else if selectedTab === '#/settings/personal'}
    <UserSetting {$user} />
  {/if}
</Modal>
