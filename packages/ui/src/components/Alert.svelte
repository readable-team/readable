<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { fade, fly } from 'svelte/transition';
  import { portal, scrollLock } from '../actions';
  import Button from './Button.svelte';
  import type { SystemStyleObject } from '@readable/styled-system/types';

  export let open: boolean;
  export let containerStyle: SystemStyleObject | undefined = undefined;
  export let actionStyle: SystemStyleObject | undefined = undefined;
  export let onAction: () => void;
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
        paddingX: '32px',
        width: 'full',
        pointerEvents: 'none',
      })}
    >
      <div
        class={css(
          {
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '16px',
            paddingTop: '44px',
            paddingX: '40px',
            paddingBottom: '36px',
            backgroundColor: 'white',
            width: '410px',
            pointerEvents: 'auto',
            userSelect: 'text',
          },
          containerStyle,
        )}
        use:scrollLock
        in:fly={{ y: 10 }}
        out:fade={{ duration: 150 }}
      >
        <header>
          <h3
            class={css({
              textStyle: '22eb',
              textAlign: 'center',
              wordBreak: 'keep-all',
            })}
          >
            <slot name="title" />
          </h3>
        </header>

        <div
          class={css({
            marginTop: '4px',
            textStyle: '15b',
            color: 'text.tertiary',
            textAlign: 'center',
            whiteSpace: 'pre-wrap',
          })}
        >
          <slot name="content" />
        </div>

        <div
          class={css(
            {
              display: 'flex',
              flexDirection: 'column',
              gap: '9px',
              marginTop: '30px',
            },
            actionStyle,
          )}
        >
          <Button size="lg" variant="danger-fill" on:click={onAction}>
            <slot name="action" />
          </Button>

          <button
            class={css({ paddingX: '16px', paddingY: '8px', textStyle: '14sb', color: 'text.secondary' })}
            type="button"
            on:click={() => (open = false)}
          >
            <slot name="cancel" />
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}
