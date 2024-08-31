<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Icon } from '@readable/ui/components';
  import IconLink2 from '~icons/lucide/link-2';
  import IconPaintbrushVertical from '~icons/lucide/paintbrush-vertical';
  import IconSettings from '~icons/lucide/settings';

  const settings = [
    {
      name: '일반',
      href: '/settings',
      icon: IconSettings,
    },
    {
      name: '테마 색상',
      href: '/settings/theme',
      icon: IconPaintbrushVertical,
    },
    {
      name: '커스텀 도메인',
      href: '/settings/domain',
      icon: IconLink2,
    },
  ];
</script>

<div class={css({ backgroundColor: 'surface.secondary', width: 'full' })}>
  <div class={flex({ width: 'full', maxWidth: '1105px', marginX: 'auto' })}>
    <aside
      class={css({
        paddingTop: '40px',
        paddingRight: '34px',
        paddingBottom: '20px',
        paddingLeft: '20px',
        minWidth: '240px',
      })}
    >
      <nav class={flex({ direction: 'column', gap: '1px' })}>
        <!-- TODO: 현재 메뉴 하이라이트, span 컬러 지정 -->
        {#each settings as setting (setting.href)}
          <a
            class={flex({
              alignItems: 'center',
              gap: '2px',
              borderRadius: '6px',
              paddingX: '4px',
              paddingY: '5px',
              textStyle: '14m',
            })}
            href={setting.href}
          >
            <Icon style={css.raw({ margin: '4px', color: 'neutral.50' })} icon={setting.icon} size={14} />
            <span>{setting.name}</span>
          </a>
        {/each}
      </nav>
    </aside>

    <slot />
  </div>
</div>
