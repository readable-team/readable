<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { graphql } from '$graphql';
  import { Img } from '$lib/components';
  import MobileSidebar from './MobileSidebar.svelte';
  import Navigation from './Navigation.svelte';

  $: query = graphql(`
    query KoLayout_Query($hostname: String!) {
      publicSite(hostname: $hostname) {
        id
        name

        logo {
          id
          ...Img_image
        }

        ...Navigation_publicSite
      }
    }
  `);
</script>

<header
  class={css({
    display: 'flex',
    position: 'sticky',
    top: '0',
    left: '0',
    right: '0',
    zIndex: '50',
    alignItems: 'center',
    height: '64px',
    backgroundColor: 'surface.primary',
    borderBottomColor: 'border.primary',
    borderBottomWidth: {
      md: '1px',
      lg: '1px',
    },
  })}
>
  <div class={css({ flex: '1', maxWidth: '1280px', marginX: 'auto', paddingX: '20px' })}>
    <h1 class={flex({ alignItems: 'center', gap: '6px', maxWidth: '394px', textStyle: '16b' })}>
      {#if $query.publicSite.logo}
        <Img
          style={css.raw({
            size: '24px',
          })}
          $image={$query.publicSite.logo}
          alt=""
          size={24}
        />
      {/if}
      <span>{$query.publicSite.name}</span>
    </h1>
  </div>
</header>

<main class={flex({ maxWidth: '1280px', marginX: 'auto', alignItems: 'flex-start' })}>
  <aside
    class={css({
      hideBelow: 'md',
      position: 'sticky',
      top: '65px',
      width: '240px',
      flexShrink: 0,
      padding: '20px',
    })}
  >
    <Navigation $publicSite={$query.publicSite} />
  </aside>

  <MobileSidebar>
    <Navigation slot="navigation" $publicSite={$query.publicSite} />
  </MobileSidebar>
  <slot />
</main>
