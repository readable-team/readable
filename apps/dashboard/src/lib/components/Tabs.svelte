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
    display: 'inline-flex',
    gap: '8px',
    position: 'relative',
  })}
>
  {#each tabs as { title, path }, i (i)}
    <div
      class={css({
        width: 'full',
        position: 'absolute',
        bottom: '0',
        borderBottomWidth: '1px',
        borderColor: 'border.sub',
        userSelect: 'none',
      })}
    />
    <a
      class={css({
        zIndex: '10',
        height: '40px',
        paddingBottom: '4px',
        _selected: {
          borderBottomWidth: '[1.5px]',
          borderColor: 'border.sub3',
          color: 'text.main5',
        },
        _hover: {
          color: 'text.main5',
        },
        color: 'text.main3',
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
        })}
      >
        {title}
      </span>
    </a>
  {/each}
</div>
