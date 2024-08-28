<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { setContext } from 'svelte';
  import { afterNavigate } from '$app/navigation';
  import { createFloatingActions } from '../actions/index';
  import type { Placement } from '@floating-ui/dom';
  import type { SystemStyleObject } from '@readable/styled-system/types';

  export let open = false;
  export let placement: Placement = 'bottom';
  export let offset = 6;
  export let style: SystemStyleObject | undefined = undefined;
  export let listStyle: SystemStyleObject | undefined = undefined;
  export let setFullWidth = false;
  export let disableAutoUpdate = false;

  let buttonEl: HTMLButtonElement | undefined;
  let menuEl: HTMLUListElement | undefined;

  const { anchor, floating } = createFloatingActions({
    placement,
    offset,
    disableAutoUpdate,
    onClickOutside: () => {
      open = false;
    },
  });

  setContext('close', () => (open = false));

  afterNavigate(() => {
    open = false;
  });

  const onKeydown = (e: KeyboardEvent) => {
    if (open) {
      if (e.key === 'Escape') {
        e.preventDefault();
        open = false;
        buttonEl?.focus();
      }

      const target = e.target as HTMLElement;
      const focusInList = menuEl?.contains(target);

      const menuItems = menuEl?.querySelectorAll('[role="menuitem"], [role="menuitemradio"]');
      if (!menuItems || menuItems.length === 0) {
        return;
      }

      // eslint-disable-next-line unicorn/prefer-spread
      const pos = Array.from(menuItems).indexOf(target);

      if (focusInList) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          const next = (menuItems[pos + 1] || menuItems[0]) as HTMLElement;
          next?.focus();
        }

        if (e.key === 'ArrowUp') {
          e.preventDefault();
          // eslint-disable-next-line unicorn/prefer-at
          const prev = (menuItems[pos - 1] || menuItems[menuItems.length - 1]) as HTMLElement;
          prev?.focus();
        }
      } else {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          (menuItems[0] as HTMLElement).focus();
        }
      }
    }
  };
</script>

<svelte:window on:keydown={onKeydown} />

<button
  bind:this={buttonEl}
  class={css(style)}
  aria-expanded={open}
  type="button"
  on:click|preventDefault={() => (open = !open)}
  use:anchor
>
  <slot name="button" {open} />
</button>

{#if open}
  <ul
    bind:this={menuEl}
    style:width={setFullWidth ? `${buttonEl?.getBoundingClientRect().width}px` : 'auto'}
    class={css(
      {
        display: 'flex',
        flexDirection: 'column',
        gap: '1px',
        borderWidth: '1px',
        borderColor: 'border.secondary',
        borderRadius: '6px',
        padding: '3px',
        backgroundColor: 'surface.primary',
        minWidth: '140px',
        boxShadow: 'normal',
        overflowY: 'auto',
        zIndex: '50',
      },
      $$slots.action && { paddingBottom: '0' },
      listStyle,
    )}
    role="menu"
    use:floating
  >
    {#if $$slots.action}
      <li>
        <ul class={css({ display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' })}>
          <slot />
        </ul>
      </li>
    {:else}
      <slot />
    {/if}

    {#if $$slots.action}
      <li class={css({ position: 'sticky', bottom: '0', paddingBottom: '12px', backgroundColor: 'surface.primary' })}>
        <slot name="action" />
      </li>
    {/if}
  </ul>
{/if}
