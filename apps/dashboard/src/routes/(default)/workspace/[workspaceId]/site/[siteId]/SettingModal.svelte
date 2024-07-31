<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Icon, Modal } from '@readable/ui/components';
  import BadgeCentIcon from '~icons/lucide/badge-cent';
  import PaintbrushIcon from '~icons/lucide/paintbrush';
  import ReceiptCentIcon from '~icons/lucide/receipt-cent';
  import SatelliteDishIcon from '~icons/lucide/satellite-dish';
  import UsersIcon from '~icons/lucide/users';
  import { fragment, graphql } from '$graphql';
  import type { SettingModal_user } from '$graphql';

  let _user: SettingModal_user;
  export { _user as $user };

  export let open = false;

  $: user = fragment(
    _user,
    graphql(`
      fragment SettingModal_user on User {
        id
        name
        email
      }
    `),
  );

  let selectedTabIndex = 0;

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
      <div
        class={css({
          flex: 'none',
          borderWidth: '1px',
          borderColor: 'border.image',
          borderRadius: 'full',
          size: '36px',
          backgroundColor: 'gray.100',
        })}
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
      <dt class={css({ textStyle: '12sb', color: 'text.tertiary' })}>사이트 설정</dt>
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

  <div class={css({ flexGrow: '1', overflowY: 'auto' })}>
    <div hidden={selectedTabIndex != 0}>기본정보 설정</div>
    <div hidden={selectedTabIndex != 1}>디자인 설정</div>
    <div hidden={selectedTabIndex != 2}>멤버 관리</div>
    <div hidden={selectedTabIndex != 3}>요금제 변경</div>
    <div hidden={selectedTabIndex != 4}>청구</div>
  </div>
</Modal>
