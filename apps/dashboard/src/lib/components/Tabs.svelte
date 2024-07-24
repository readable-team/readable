<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { page } from '$app/stores';

  export let tabs: {
    title: string;
    path: string;
  }[] = [];

  $: currentPath = $page.url.pathname;
</script>

<div
  class={css({
    display: 'flex',
    gap: '8px',
    position: 'relative',
    paddingLeft: '30px',
  })}
>
  {#each tabs as { title, path }, i (i)}
    <div
      class={css({
        width: 'full',
        position: 'absolute',
        left: '0',
        bottom: '0',
        borderBottomWidth: '1px',
        borderColor: 'divider.primary',
        userSelect: 'none',
      })}
    />
    <a
      class={css({
        'zIndex': '10',
        'height': '40px',
        'paddingBottom': '4px',
        '_selected': {
          'borderBottomWidth': '[1.5px]',
          'borderColor': 'tab.border',
          'color': 'tab.foreground.selected',
          '& > span': {
            backgroundColor: 'tab.background.selected',
          },
        },
        '_hover': {
          'color': 'tab.foreground.hover',
          '& > span': {
            backgroundColor: 'tab.background.hover',
          },
        },
        'color': 'tab.foreground',
        '& > span': {
          backgroundColor: 'tab.background',
        },
      })}
      aria-selected={path === currentPath ? 'true' : 'false'}
      href={path}
      role="tab"
    >
      <span
        class={css({
          display: 'flex',
          height: '36px',
          paddingX: '14px',
          alignItems: 'center',
          justifyContent: 'center',
          textStyle: '14b',
          borderRadius: '4px',
        })}
      >
        {title}
      </span>
    </a>
  {/each}
</div>
