<script lang="ts">
  import { css, cx } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Icon } from '@readable/ui/components';
  import { page } from '$app/stores';
  import type { ComponentType } from 'svelte';

  export let path: string;
  export let title: string;
  export let icon: ComponentType;
  export let count: number | undefined = undefined;

  type $$Props = {
    path: string;
    title: string;
    icon: ComponentType;
    count?: number;
  };

  $: currentPath = $page.url.pathname;
</script>

<a
  class={flex({
    'paddingX': '12px',
    'gap': '8px',
    'height': '47px',
    'alignItems': 'center',
    'textStyle': '16sb',
    'userSelect': 'none',
    'borderRadius': '8px',
    'color': 'text.tertiary',
    '& > .count': {
      color: 'text.tertiary',
    },
    '_hover': {
      backgroundColor: 'neutral.30',
      _currentPage: {
        // FIXME: _currentPage가 _hover보다 우선해야 하는데 실제로는 반대로 적용되어서 일단 중복 정의함..
        backgroundColor: 'neutral.30',
        color: 'text.primary',
      },
    },
    '_currentPage': {
      backgroundColor: 'neutral.30',
      color: 'text.primary',
    },
  })}
  aria-current={currentPath.startsWith(path) ? 'page' : undefined}
  href={path}
>
  <Icon {icon} size={14} />
  {title}
  {#if count !== undefined}
    <span
      class={cx(
        'count',
        css({
          marginLeft: 'auto',
        }),
      )}
    >
      {count}
    </span>
  {/if}
</a>
