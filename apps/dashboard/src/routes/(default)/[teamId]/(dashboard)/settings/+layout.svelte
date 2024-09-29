<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import CoinsIcon from '~icons/lucide/coins';
  import SettingsIcon from '~icons/lucide/settings';
  import { page } from '$app/stores';
  import { SettingTabItem } from '$lib/components';

  $: settings = [
    {
      name: '일반',
      href: `/${$page.params.teamId}/settings`,
      icon: SettingsIcon,
      selected: $page.url.pathname === `/${$page.params.teamId}/settings`,
    },
    {
      name: '결제 및 청구',
      href: `/${$page.params.teamId}/settings/billing`,
      icon: CoinsIcon,
      selected: $page.url.pathname === `/${$page.params.teamId}/settings/billing`,
    },
  ];
</script>

<div
  class={flex({
    direction: 'column',
    width: 'full',
    minHeight: 'full',
    height: 'fit',
  })}
>
  <div class={flex({ grow: '1', width: 'full', maxWidth: '920px', marginX: 'auto', height: 'full' })}>
    <aside
      class={css({
        borderRightWidth: '1px',
        borderRightColor: 'border.secondary',
        paddingTop: '60px',
        paddingRight: '32px',
        paddingBottom: '20px',
        minWidth: '218px',
      })}
    >
      <nav class={flex({ direction: 'column', gap: '2px' })}>
        {#each settings as setting (setting.href)}
          <SettingTabItem {setting} />
        {/each}
      </nav>
    </aside>

    <div class={css({ paddingTop: '40px', paddingLeft: '32px', paddingBottom: '120px', width: 'full' })}>
      <slot />
    </div>
  </div>
</div>
