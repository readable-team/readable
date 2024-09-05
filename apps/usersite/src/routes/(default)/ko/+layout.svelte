<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Icon } from '@readable/ui/components';
  import CloseIcon from '~icons/lucide/x';
  import ReadableIcon from '~icons/rdbl/readable';
  import { env } from '$env/dynamic/public';
  import { graphql } from '$graphql';
  import { Img } from '$lib/components';
  import { mobileNavOpen } from '$lib/stores/ui';
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

  <!-- FIXME: 모바일 사이드바 컴포넌트 분리 -->
  <div
    class={css({
      hideFrom: 'md',
    })}
    hidden={!$mobileNavOpen}
  >
    <div
      class={css({
        position: 'fixed',
        inset: '0',
        backgroundColor: 'gray.1000/24',
        zIndex: '100',
      })}
      role="button"
      tabindex="-1"
      on:click={() => mobileNavOpen.set(false)}
      on:keypress={null}
    />
    <aside
      class={flex({
        position: 'fixed',
        top: '0',
        left: '0',
        width: '[90%]',
        height: 'screen',
        backgroundColor: 'surface.secondary',
        zIndex: '[200]',
        paddingX: '20px',
        paddingY: '18px',
        flexDirection: 'column',
        gap: '32px',
      })}
    >
      <div
        class={css({
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingX: '12px',
          paddingBottom: '10px',
          borderBottomWidth: '1px',
          borderBottomColor: 'border.primary',
        })}
      >
        <h2 class={css({ textStyle: '16b' })}>페이지 목록</h2>
        <button class={css({ padding: '3px' })} type="button" on:click={() => mobileNavOpen.set(false)}>
          <Icon icon={CloseIcon} size={16} />
        </button>
      </div>
      <Navigation $publicSite={$query.publicSite} />
      <div
        class={css({
          position: 'absolute',
          bottom: '0',
          left: '0',
          width: 'full',
          padding: '20px',
        })}
      >
        <a
          class={flex({
            alignItems: 'center',
            gap: '8px',
            textStyle: '13eb',
            color: 'text.tertiary',
          })}
          href={env.PUBLIC_WEBSITE_URL}
          rel="noopener noreferrer"
          target="_blank"
        >
          <div class={css({ padding: '4px', backgroundColor: 'neutral.60', borderRadius: '6px' })}>
            <Icon style={css.raw({ '& path': { fill: 'neutral.0' } })} icon={ReadableIcon} size={18} />
          </div>
          <span>Powered by Readable</span>
        </a>
      </div>
    </aside>
  </div>

  <slot />
</main>
