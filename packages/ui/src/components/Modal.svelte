<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { fade, fly } from 'svelte/transition';
  import { portal, scrollLock } from '../actions';
  import type { SystemStyleObject } from '@readable/styled-system/types';

  export let open = false;
  export let close: () => void;
  export let style: SystemStyleObject | undefined = undefined;
</script>

<svelte:window
  on:keydown={(e) => {
    if (open && e.key === 'Escape') {
      open = false;
      close();
    }
  }}
/>

{#if open}
  <div class={css({ position: 'fixed', inset: '0', zIndex: '50' })} use:portal>
    <div
      class={css({ position: 'absolute', inset: '0', backgroundColor: 'gray.1000/60' })}
      role="button"
      tabindex="-1"
      on:click={() => {
        open = false;
        close();
      }}
      on:keypress={null}
      transition:fade={{ duration: 150 }}
    />

    <div
      class={css({
        position: 'absolute',
        inset: '0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        width: 'full',
        pointerEvents: 'none',
      })}
    >
      <div
        class={css({
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          flexGrow: '1',
          borderRadius: '16px',
          backgroundColor: 'surface.tertiary',
          pointerEvents: 'auto',
          size: 'full',
          maxWidth: '946px',
          maxHeight: '705px',
        })}
        use:scrollLock
        in:fly={{ y: 10 }}
        out:fade={{ duration: 150 }}
      >
        <div class={css({ height: 'full', overflowY: 'auto' }, style)} data-scroll-lock-ignore>
          <aside
            class={flex({
              direction: 'column',
              gap: '16px',
              borderTopLeftRadius: '16px',
              borderBottomLeftRadius: '16px',
              paddingX: '16px',
              paddingY: '32px',
              backgroundColor: 'sidebar.surface',
              width: '240px',
              overflowY: 'auto',
            })}
          >
            <slot name="sidebar" />
          </aside>

          <section class={css({ flexGrow: '1', padding: '32px', overflowY: 'auto' })}>
            <slot />
          </section>
        </div>
      </div>
    </div>
  </div>
{/if}
