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
        'height': '36px',
        'paddingBottom': '4px',
        '_selected': {
          'borderBottomWidth': '[1.5px]',
          'borderColor': { base: 'gray.1000', _dark: 'darkgray.100' },
          'color': { base: 'gray.1000', _dark: 'darkgray.100' },
          '& > span': {
            backgroundColor: { base: 'white', _dark: 'darkgray.1000' },
          },
        },
        '_hover': {
          'color': { base: 'gray.1000', _dark: 'darkgray.100' },
          '& > span': {
            backgroundColor: { base: 'gray.100', _dark: 'darkgray.900' },
          },
        },
        'color': { base: 'gray.500', _dark: 'darkgray.600' },
        '& > span': {
          backgroundColor: { base: 'white', _dark: 'darkgray.1000' },
        },
      })}
      aria-selected={path === currentPath ? 'true' : 'false'}
      href={path}
      role="tab"
    >
      <span
        class={css({
          display: 'flex',
          height: '31px',
          paddingX: '14px',
          alignItems: 'center',
          justifyContent: 'center',
          textStyle: '16b',
          borderRadius: '4px',
        })}
      >
        {title}
      </span>
    </a>
  {/each}
</div>
