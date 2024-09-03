<script lang="ts">
  import { flex } from '@readable/styled-system/patterns';
  import { Icon } from '@readable/ui/components';
  import type { ComponentType } from 'svelte';

  export let setting: {
    icon: ComponentType;
    name: string;
    href: string;
    selected: boolean;
  };
</script>

<a
  class={flex({
    align: 'center',
    gap: '10px',
    borderRadius: '4px',
    paddingX: '12px',
    textStyle: '15m',
    color: 'text.secondary',
    width: 'full',
    height: '36px',
    _hover: { backgroundColor: 'neutral.20' },
    _selected: {
      'backgroundColor': 'neutral.20',
      'color': 'text.primary',
      '& svg': { color: 'text.secondary' },
    },
  })}
  aria-selected={setting.selected}
  href={setting.href}
  role="tab"
>
  <Icon icon={setting.icon} size={18} />
  <span>{setting.name}</span>
</a>
