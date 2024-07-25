<script generics="T extends 'button' | 'link' = 'button'" lang="ts">
  import { css } from '@readable/styled-system/css';
  import { getContext } from 'svelte';
  import type { SystemStyleObject } from '@readable/styled-system/types';
  import type { HTMLButtonAttributes } from 'svelte/elements';

  type $$Props = {
    type?: T;
    style?: SystemStyleObject;
    disabled?: boolean;
  } & (T extends 'link' ? { href: string; external?: boolean } : unknown) &
    (T extends 'button' ? Omit<HTMLButtonAttributes, 'type' | 'style' | 'disabled'> : unknown);

  type $$Events = T extends 'link' ? unknown : { click: MouseEvent };

  export let type: 'button' | 'link' = 'button';

  export let style: SystemStyleObject | undefined = undefined;

  export let disabled = false;
  export let href: string | undefined = undefined;
  export let external = !href?.startsWith('/');

  let element: 'a' | 'button';
  $: element = type === 'link' ? 'a' : type;
  $: props =
    (type === 'link' && { href: disabled || href }) || (type === 'button' && { type: 'button', disabled }) || {};

  let close = getContext<undefined | (() => void)>('close');
</script>

<svelte:element
  this={element}
  class={css(
    {
      borderRadius: '8px',
      padding: '12px',
      width: 'full',
      textStyle: '16sb',
      textAlign: 'left',
      color: 'text.secondary',
      _hover: {
        backgroundColor: 'neutral.10',
      },
      _selected: {
        color: 'text.accent',
        backgroundColor: {
          base: 'accent.20',
          _hover: 'accent.30',
        },
      },
    },
    style,
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
  <slot />
</svelte:element>
