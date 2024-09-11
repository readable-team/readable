<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { fade, fly } from 'svelte/transition';
  import { scrollLock } from '../actions';
  import Button from './Button.svelte';
  import Dialog from './dialog/Dialog.svelte';
  import type { SystemStyleObject } from '@readable/styled-system/types';

  export let open: boolean;
  export let containerStyle: SystemStyleObject | undefined = undefined;
  export let actionStyle: SystemStyleObject | undefined = undefined;
  export let onAction: () => void;
  export let variant: 'primary' | 'danger' = 'danger';
</script>

<Dialog {open} on:close={() => (open = false)}>
  <div
    class={css({ position: 'absolute', inset: '0', backgroundColor: 'gray.1000/24' })}
    role="button"
    tabindex="-1"
    on:click={() => (open = false)}
    on:keypress={null}
    transition:fade|global={{ duration: 150 }}
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
          borderWidth: '1px',
          borderColor: 'border.primary',
          borderRadius: '16px',
          padding: '32px',
          backgroundColor: 'background.overlay',
          pointerEvents: 'auto',
          userSelect: 'text',
          width: 'auto',
          minWidth: '480px',
          maxWidth: '600px',
          boxShadow: 'strong',
        },
        containerStyle,
      )}
      use:scrollLock
      in:fly|global={{ y: 10 }}
      out:fade|global={{ duration: 150 }}
    >
      <header>
        <h3
          class={css({
            textStyle: '20b',
            wordBreak: 'keep-all',
            overflowWrap: 'break-word',
          })}
        >
          <slot name="title" />
        </h3>
      </header>

      <div
        class={css({
          marginTop: '6px',
          textStyle: '15r',
          color: 'text.secondary',
        })}
      >
        <slot name="content" />
      </div>

      <div
        class={css(
          {
            display: 'flex',
            gap: '8px',
            marginTop: '32px',
            justifyContent: 'flex-end',
          },
          actionStyle,
        )}
      >
        <Button style={css.raw({ minWidth: '95px' })} size="lg" variant="secondary" on:click={() => (open = false)}>
          <slot name="cancel" />
        </Button>
        <Button
          style={css.raw({ minWidth: '95px' })}
          size="lg"
          variant={variant === 'primary' ? 'primary' : 'danger-fill'}
          on:click={() => {
            onAction();
            open = false;
          }}
        >
          <slot name="action" />
        </Button>
      </div>
    </div>
  </div>
</Dialog>
