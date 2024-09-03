<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import IconLink2 from '~icons/lucide/link-2';
  import IconPaintbrushVertical from '~icons/lucide/paintbrush-vertical';
  import IconSettings from '~icons/lucide/settings';
  import { page } from '$app/stores';
  import SettingTabItem from '../SettingTabItem.svelte';

  export let data;

  $: settings = [
    {
      name: '일반',
      href: `/${data.props.siteId}/settings`,
      icon: IconSettings,
      selected: $page.url.pathname === `/${data.props.siteId}/settings/`,
    },
    {
      name: '테마 색상',
      href: `/${data.props.siteId}/settings/theme`,
      icon: IconPaintbrushVertical,
      selected: $page.url.pathname === `/${data.props.siteId}/settings/theme/`,
    },
    {
      name: '커스텀 도메인',
      href: `/${data.props.siteId}/settings/domain/`,
      icon: IconLink2,
      selected: $page.url.pathname === `/${data.props.siteId}/settings/domain/`,
    },
  ];
</script>

<div
  class={flex({
    direction: 'column',
    backgroundColor: 'surface.secondary',
    width: 'full',
    minHeight: 'full',
    height: 'fit',
  })}
>
  <div class={flex({ grow: '1', width: 'full', maxWidth: '1105px', marginX: 'auto', height: 'full' })}>
    <aside
      class={css({
        borderRightWidth: '1px',
        borderRightColor: 'border.primary',
        paddingTop: '40px',
        paddingRight: '34px',
        paddingBottom: '20px',
        paddingLeft: '20px',
        minWidth: '240px',
      })}
    >
      <nav class={flex({ direction: 'column', gap: '1px' })}>
        {#each settings as setting (setting.href)}
          <SettingTabItem {setting} />
        {/each}
      </nav>
    </aside>

    <slot />
  </div>
</div>
