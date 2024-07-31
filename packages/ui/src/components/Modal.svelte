<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { fade, fly } from 'svelte/transition';
  import { portal, scrollLock } from '../actions';
  import type { SystemStyleObject } from '@readable/styled-system/types';

  export let open = false;
  export let style: SystemStyleObject | undefined = undefined;
</script>

<svelte:window on:keydown={(e) => e.key === 'Escape' && (open = false)} />

{#if open}
  <div class={css({ position: 'fixed', inset: '0', zIndex: '50' })} use:portal>
    <div
      class={css({ position: 'absolute', inset: '0', backgroundColor: 'gray.1000/60' })}
      role="button"
      tabindex="-1"
      on:click={() => (open = false)}
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
          backgroundColor: { base: 'white', _dark: 'darkgray.700' },
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
          <slot />
        </div>
      </div>
    </div>
  </div>
{/if}
