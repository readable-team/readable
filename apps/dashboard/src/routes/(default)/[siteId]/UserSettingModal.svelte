<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { scrollLock } from '@readable/ui/actions';
  import { HorizontalDivider, Icon } from '@readable/ui/components';
  import Building2Icon from '~icons/lucide/building-2';
  import CircleUserIcon from '~icons/lucide/circle-user';
  import CreditCardIcon from '~icons/lucide/credit-card';
  import UsersRoundIcon from '~icons/lucide/users-round';
  import XIcon from '~icons/lucide/x';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { fragment, graphql } from '$graphql';
  import { Img } from '$lib/components';
  import Subscription from './(settingModal)/Subscription.svelte';
  import TeamMembers from './(settingModal)/TeamMembers.svelte';
  import TeamSetting from './(settingModal)/TeamSetting.svelte';
  import UserSetting from './(settingModal)/UserSetting.svelte';
  import SettingTabItem from './SettingTabItem.svelte';
  import type { UserSettingModal_site, UserSettingModal_user } from '$graphql';

  let _user: UserSettingModal_user;
  let _site: UserSettingModal_site;
  export { _site as $site, _user as $user };

  export let open = false;

  $: selectedTab = $page.url.searchParams.get('tab');

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

  $: personalSettings = [
    {
      icon: CircleUserIcon,
      name: '개인 설정',
      href: '?tab=settings/personal',
      selected: selectedTab === 'settings/personal',
    },
  ];

  $: teamSettings = [
    {
      icon: Building2Icon,
      name: '팀 설정',
      href: '?tab=settings/team',
      selected: selectedTab === 'settings/team',
    },
    {
      icon: UsersRoundIcon,
      name: '멤버 관리',
      href: '?tab=settings/team/members',
      selected: selectedTab === 'settings/team/members',
    },
    {
      icon: CreditCardIcon,
      name: '구독 및 결제',
      href: '?tab=settings/team/subscription',
      selected: selectedTab === 'settings/team/subscription',
    },
  ];
</script>

{#if open}
  <div
    class={flex({
      position: 'fixed',
      inset: '0',
      zIndex: '20',
      width: 'screen',
      height: 'screen',
      backgroundColor: 'surface.primary',
      overflow: 'auto',
    })}
  >
    <div
      class={css({
        position: 'absolute',
        left: '0',
        width: '1/2',
        height: 'full',
        backgroundColor: 'surface.secondary',
      })}
      aria-hidden="true"
    />

    <button
      class={css({
        position: 'fixed',
        top: '24px',
        right: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '40px',
        height: '40px',
        borderRadius: 'full',
        backgroundColor: 'surface.primary',
        color: 'text.secondary',
        transition: '[background-color 0.2s]',
        _hover: {
          backgroundColor: 'neutral.20',
          color: 'text.primary',
        },
        zIndex: '30',
      })}
      aria-label="닫기"
      type="button"
      on:click={() => {
        const currentPath = $page.url.pathname;
        goto(currentPath, { replaceState: true });
      }}
    >
      <Icon icon={XIcon} size={24} />
    </button>

    <div
      class={flex({
        position: 'relative',
        marginX: 'auto',
        overflow: 'auto',
        minWidth: '1064px',
      })}
      use:scrollLock
    >
      <div
        class={flex({
          flexDirection: 'column',
          flex: 'none',
          minWidth: '240px',
          width: '[30%]',
          maxWidth: '280px',
          paddingX: '20px',
          paddingY: '60px',
          overflow: 'auto',
        })}
      >
        <div
          class={flex({
            align: 'center',
            gap: '6px',
            marginBottom: '2px',
            paddingX: '10px',
            paddingY: '5px',
            alignItems: 'center',
          })}
        >
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

          <p class={css({ textStyle: '13m', truncate: true, color: 'text.secondary' })}>{$site.team.name}</p>
        </div>

        <dl class={flex({ direction: 'column', gap: '2px', paddingTop: '1px' })}>
          {#each teamSettings as setting (setting.name)}
            <dd>
              <SettingTabItem {setting} />
            </dd>
          {/each}
        </dl>

        <HorizontalDivider style={css.raw({ marginY: '16px' })} />

        <div
          class={flex({
            align: 'center',
            gap: '6px',
            marginBottom: '2px',
            paddingX: '10px',
            paddingY: '5px',
            alignItems: 'center',
          })}
        >
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

        <dl class={flex({ direction: 'column', gap: '2px', paddingTop: '1px' })}>
          {#each personalSettings as setting (setting.name)}
            <dd>
              <SettingTabItem {setting} />
            </dd>
          {/each}
        </dl>
      </div>

      <div
        class={flex({
          width: '784px',
          height: 'full',
          flexDirection: 'column',
          backgroundColor: 'surface.primary',
          paddingY: '60px',
          paddingX: '32px',
          overflow: 'auto',
        })}
      >
        {#if selectedTab === 'settings/team'}
          <TeamSetting $team={$site.team} />
        {:else if selectedTab === 'settings/team/members'}
          <TeamMembers $team={$site.team} />
        {:else if selectedTab === 'settings/team/subscription'}
          <Subscription />
        {:else if selectedTab === 'settings/personal'}
          <UserSetting {$user} />
        {/if}
      </div>
    </div>
  </div>
{/if}
