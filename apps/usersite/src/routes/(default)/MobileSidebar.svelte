<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Icon } from '@readable/ui/components';
  import { fade, fly } from 'svelte/transition';
  import CloseIcon from '~icons/lucide/x';
  import ReadableIcon from '~icons/rdbl/readable';
  import { env } from '$env/dynamic/public';
  import { mobileNavOpen } from '$lib/stores/ui';
</script>

<svelte:window
  on:resize={() => {
    if ($mobileNavOpen && window.innerWidth >= 768) {
      // NOTE: 닫아주지 않으면 scrollLock이 계속 적용됨
      mobileNavOpen.set(false);
    }
  }}
/>

{#if $mobileNavOpen}
  <div
    class={css({
      hideFrom: 'md',
      position: 'relative',
    })}
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
      in:fade={{ duration: 200 }}
      out:fade={{ duration: 200 }}
    />
    <aside
      class={flex({
        position: 'fixed',
        top: '0',
        left: '0',
        width: '[90%]',
        bottom: '0',
        backgroundColor: 'surface.secondary',
        zIndex: '[200]',
        paddingBottom: '0',
        flexDirection: 'column',
        borderRightWidth: '1px',
        borderRightColor: 'border.primary',
      })}
      in:fly={{ x: -200, duration: 200 }}
      out:fly={{ x: -200, duration: 200 }}
    >
      <div
        class={css({
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingLeft: '28px',
          paddingRight: '24px',
          paddingY: '17px',
          borderBottomWidth: '1px',
          borderBottomColor: 'border.primary',
        })}
      >
        <h2 class={css({ textStyle: '18b' })}>페이지 목록</h2>
        <button type="button" on:click={() => mobileNavOpen.set(false)}>
          <Icon style={css.raw({ color: 'neutral.60' })} icon={CloseIcon} size={24} />
        </button>
      </div>
      <div
        class={flex({
          flexDirection: 'column',
          justifyContent: 'space-between',
          flex: '1',
          overflow: 'auto',
          overscrollBehavior: 'contain',
        })}
      >
        <div class={css({ padding: '16px', paddingBottom: '80px' })}>
          <slot name="navigation" />
        </div>

        <div
          class={css({
            marginTop: 'auto',
            width: 'full',
            paddingTop: '20px',
            paddingX: '28px',
            paddingBottom: '32px',
          })}
        >
          <a
            class={flex({
              alignItems: 'center',
              gap: '10px',
              textStyle: '13b',
              color: 'text.tertiary',
            })}
            href={env.PUBLIC_WEBSITE_URL}
            rel="noopener noreferrer"
            target="_blank"
          >
            <div class={css({ padding: '4px', backgroundColor: 'text.tertiary', borderRadius: '6px' })}>
              <Icon style={css.raw({ '& path': { fill: 'neutral.0' } })} icon={ReadableIcon} size={18} />
            </div>
            <span>Powered by Readable</span>
          </a>
        </div>
      </div>
    </aside>
  </div>
{/if}
