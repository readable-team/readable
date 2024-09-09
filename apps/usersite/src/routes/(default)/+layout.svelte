<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Icon } from '@readable/ui/components';
  import ReadableIcon from '~icons/rdbl/readable';
  import { env } from '$env/dynamic/public';
  import { graphql } from '$graphql';

  $: query = graphql(`
    query DefaultLayout_Query {
      publicSite {
        id
        url
        themeColor

        logo {
          id
          url
        }
      }
    }
  `);
</script>

<svelte:head>
  {#if $query.publicSite.logo}
    <link href={`${$query.publicSite.logo.url}?s=32&f=png`} rel="icon" sizes="32x32" type="image/png" />
  {/if}
</svelte:head>

<div style:--usersite-theme-color={$query.publicSite.themeColor} class={css({ display: 'contents' })}>
  <slot />
</div>

<!-- TODO: 결제하면 숨기기 -->
<a
  class={flex({
    'position': 'fixed',
    'bottom': '24px',
    'right': '28px',
    'gap': '6px',
    'paddingX': '12px',
    'paddingY': '9px',
    'alignItems': 'center',
    'borderRadius': '8px',
    'boxShadow': 'strong',
    'backgroundColor': {
      base: 'gray.1000',
      _dark: 'darkgray.100',
    },
    'color': 'neutral.0',
    '& svg path': {
      fill: 'neutral.0',
    },
    'textStyle': '13b',
  })}
  href={env.PUBLIC_WEBSITE_URL}
  rel="noopener noreferrer"
  target="_blank"
>
  <Icon icon={ReadableIcon} size={18} />
  <span>Powered by readable</span>
</a>
