<script lang="ts">
  import { css } from '@readable/styled-system/css';
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
      class={css({ position: 'absolute', inset: '0', backgroundColor: 'gray.1000/24' })}
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
        width: '[fit-content]',
        margin: 'auto',
        pointerEvents: 'none',
      })}
    >
      <div
        class={css({
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          flexGrow: '1',
          borderWidth: '1px',
          borderColor: 'border.primary',
          borderRadius: '[20px]',
          backgroundColor: 'background.overlay',
          pointerEvents: 'auto',
          size: '[fit-content]',
          maxWidth: '946px',
          maxHeight: '705px',
          boxShadow: 'strong',
        })}
        use:scrollLock
        in:fly={{ y: 10 }}
        out:fade={{ duration: 150 }}
      >
        <div class={css({ height: 'full', overflowY: 'auto' }, style)} data-scroll-lock-ignore>
          <section class={css({ flexGrow: '1', overflowY: 'auto' })}>
            <slot />
          </section>
        </div>
      </div>
    </div>
  </div>
{/if}
