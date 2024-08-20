<script generics="T extends 'button' | 'link' = 'button'" lang="ts">
  import { css, cva, cx } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { getContext } from 'svelte';
  import type { SystemStyleObject } from '@readable/styled-system/types';
  import type { HTMLButtonAttributes } from 'svelte/elements';

  type $$Props = {
    type?: T;
    style?: SystemStyleObject;
    disabled?: boolean;
    variant?: 'default' | 'danger';
  } & (T extends 'link' ? { href: string; external?: boolean } : unknown) &
    (T extends 'button' ? Omit<HTMLButtonAttributes, 'type' | 'style' | 'disabled'> : unknown);

  type $$Events = T extends 'link' ? unknown : { click: MouseEvent };

  export let type: 'button' | 'link' = 'button';

  export let style: SystemStyleObject | undefined = undefined;

  export let variant: 'default' | 'danger' = 'default';

  export let disabled = false;
  export let href: string | undefined = undefined;
  export let external = !href?.startsWith('/');

  let element: 'a' | 'button';
  $: element = type === 'link' ? 'a' : type;
  $: props =
    (type === 'link' && { 'href': disabled || href, 'data-sveltekit-preload-data': false }) ||
    (type === 'button' && { type: 'button', disabled }) ||
    {};

  let close = getContext<undefined | (() => void)>('close');
</script>

<svelte:element
  this={element}
  class={cx(
    cva({
      base: flex.raw({
        alignItems: 'center',
        gap: '10px',
        borderRadius: '6px',
        paddingX: '10px',
        paddingY: '8px',
        textStyle: '14sb',
        textAlign: 'left',
        color: 'text.secondary',
        width: 'full',
        _hover: {
          backgroundColor: 'neutral.10',
        },
        _selected: {
          color: 'text.primary',
          backgroundColor: 'neutral.20',
        },
      }),
      variants: {
        variant: {
          default: {
            color: 'text.secondary',
          },
          danger: {
            color: 'text.danger',
          },
        },
      },
    })({ variant }),
    css(style),
  )}
  role="menuitem"
  tabindex="-1"
  on:click
  on:click={close}
  {...external && {
    target: '_blank',
    rel: 'noopener noreferrer',
  }}
  {...props}
  {...$$restProps}
>
  <slot name="prefix" />
  <slot />
</svelte:element>
