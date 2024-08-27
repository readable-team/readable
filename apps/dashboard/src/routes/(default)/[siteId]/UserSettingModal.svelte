<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { HorizontalDivider, Icon } from '@readable/ui/components';
  import Building2Icon from '~icons/lucide/building-2';
  import CircleUserIcon from '~icons/lucide/circle-user';
  import UsersRoundIcon from '~icons/lucide/users-round';
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
          name
          avatar {
            id
            ...Img_image
          }

          ...TeamSetting_team
          ...TeamMembers_team
        }
      }
    `),
  );

  const personalSettings = [
    {
      icon: CircleUserIcon,
      text: '개인 설정',
      tab: '#/settings/personal',
    },
  ];

  const teamSettings = [
    {
      icon: Building2Icon,
      text: '팀 설정',
      tab: '#/settings/team',
    },
    {
      icon: UsersRoundIcon,
      text: '멤버 관리',
      tab: '#/settings/team/members',
    },
  ];

  const tabItemStyle = flex({
    align: 'center',
    gap: '10px',
    borderRadius: '4px',
    paddingX: '12px',
    paddingY: '6px',
    textStyle: '14m',
    color: 'text.secondary',
    width: 'full',
    _hover: { backgroundColor: 'neutral.20' },
    _selected: { backgroundColor: 'neutral.20', color: 'text.primary' },
  });
</script>

{#if open}
  <div
    class={flex({
      position: 'fixed',
      inset: '0',
      zIndex: '100',
      width: 'screen',
      height: 'screen',
    })}
  >
    <div
      class={css({ position: 'absolute', left: '0', width: '1/2', height: 'full', backgroundColor: 'sidebar.surface' })}
      aria-hidden="true"
    />
    <div
      class={css({
        position: 'absolute',
        right: '0',
        width: '1/2',
        height: 'full',
        backgroundColor: 'surface.primary',
      })}
      aria-hidden="true"
    />

    <button
      class={css({
        position: 'absolute',
        top: '50px',
        right: '50px',
        width: '100px',
        height: '100px',
        backgroundColor: '[red]',
      })}
      type="button"
      on:click={() => {
        const currentPath = $page.url.pathname;
        goto(currentPath, { replaceState: true });
      }}
    >
      close
    </button>

    <div
      class={flex({
        position: 'relative',
        width: '1064px',
        height: 'full',
        marginX: 'auto',
        display: 'flex',
      })}
    >
      <div
        class={flex({
          flexDirection: 'column',
          width: '220px',
          paddingX: '20px',
          paddingY: '60px',
        })}
      >
        <div class={flex({ align: 'center', gap: '6px', paddingX: '10px', paddingY: '5px', alignItems: 'center' })}>
          <Img
            style={css.raw({
              flex: 'none',
              borderWidth: '1px',
              borderColor: 'border.image',
              borderRadius: 'full',
              size: '18px',
            })}
            $image={$site.team.avatar}
            alt={`${$site.team.name}의 아바타`}
            size={24}
          />

          <p class={css({ textStyle: '13b', truncate: true, color: 'text.secondary' })}>{$site.team.name}</p>
        </div>

        <dl class={flex({ direction: 'column', gap: '1px', paddingTop: '1px' })}>
          {#each teamSettings as setting (setting.text)}
            <dd>
              <a class={tabItemStyle} aria-selected={selectedTab === setting.tab} href={setting.tab} role="tab">
                <Icon icon={setting.icon} />
                <span>{setting.text}</span>
              </a>
            </dd>
          {/each}
        </dl>

        <HorizontalDivider style={css.raw({ marginY: '16px' })} />

        <div class={flex({ align: 'center', gap: '6px', paddingX: '10px', paddingY: '5px', alignItems: 'center' })}>
          <Img
            style={css.raw({
              flex: 'none',
              borderWidth: '1px',
              borderColor: 'border.image',
              borderRadius: 'full',
              size: '18px',
            })}
            $image={$user.avatar}
            alt={`${$user.name}의 아바타`}
            size={24}
          />

          <p class={css({ textStyle: '13b', truncate: true, color: 'text.secondary' })}>{$user.name}</p>
        </div>

        <dl class={flex({ direction: 'column', gap: '4px', paddingTop: '1px' })}>
          {#each personalSettings as setting (setting.text)}
            <dd>
              <a class={tabItemStyle} aria-selected={selectedTab === setting.tab} href={setting.tab} role="tab">
                <Icon icon={setting.icon} />
                <span>{setting.text}</span>
              </a>
            </dd>
          {/each}
        </dl>
      </div>

      <div
        class={flex({
          flex: '1',
          flexDirection: 'column',
          backgroundColor: 'surface.primary',
        })}
      >
        {#if selectedTab === '#/settings/team'}
          <TeamSetting $team={$site.team} />
        {:else if selectedTab === '#/settings/team/members'}
          <TeamMembers $team={$site.team} />
        {:else if selectedTab === '#/settings/personal'}
          <UserSetting {$user} />
        {/if}
      </div>
    </div>
  </div>
{/if}
