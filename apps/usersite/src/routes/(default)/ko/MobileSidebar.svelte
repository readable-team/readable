<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { scrollLock } from '@readable/ui/actions';
  import { Icon } from '@readable/ui/components';
  import CloseIcon from '~icons/lucide/x';
  import ReadableIcon from '~icons/rdbl/readable';
  import { env } from '$env/dynamic/public';
  import { mobileNavOpen } from '$lib/stores/ui';
</script>

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
      paddingBottom: '0',
      flexDirection: 'column',
    })}
    use:scrollLock
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
    <div
      class={flex({
        flexDirection: 'column',
        justifyContent: 'space-between',
        paddingTop: '32px',
        flex: '1',
        overflow: 'auto',
        paddingBottom: '18px',
      })}
    >
      <slot name="navigation" />
      <div
        class={css({
          marginTop: 'auto',
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
    </div>
  </aside>
</div>
