<script generics="T extends 'button' | 'link' = 'button'" lang="ts">
  import { css, cva, cx } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { getContext } from 'svelte';
  import type { SystemStyleObject } from '@readable/styled-system/types';
  import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';

  type $$Props = {
    type?: T;
    style?: SystemStyleObject;
    disabled?: boolean;
    variant?: 'default' | 'danger';
  } & (T extends 'link'
    ? Omit<HTMLAnchorAttributes, 'type' | 'style' | 'disabled'> & { external?: boolean }
    : unknown) &
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
    (type === 'link' && { href: disabled || href, 'data-sveltekit-preload-data': false }) ||
    (type === 'button' && { type: 'button', disabled }) ||
    {};

  let close = getContext<undefined | (() => void)>('close');

  let focused = false;
</script>

<svelte:element
  this={element}
  role="menuitem"
  tabindex={focused ? 0 : -1}
  on:focus={() => (focused = true)}
  on:blur={() => (focused = false)}
  on:click
  on:click={close}
  {...external && {
    target: '_blank',
    rel: 'noopener noreferrer',
  }}
  {...props}
  {...$$restProps}
  {...type === 'link' && {
    // NOTE: link 타입이어도 _enabled 스타일이 적용되도록 함
    'aria-disabled': 'false',
  }}
  class={cx(
    cva({
      base: flex.raw({
        alignItems: 'center',
        gap: '10px', // NOTE: override 하는 workaround: style에 columnGap을 넘기기
        borderRadius: '6px',
        marginX: '6px',
        paddingX: '12px',
        paddingY: '7px',
        textStyle: '14m',
        textAlign: 'left',
        color: 'text.secondary',
        _enabled: {
          _hover: {
            backgroundColor: 'neutral.10',
          },
          _focus: {
            backgroundColor: 'neutral.20',
          },
          _active: {
            color: 'text.primary',
            backgroundColor: 'neutral.10',
          },
          _selected: {
            color: 'text.primary',
            backgroundColor: 'neutral.10',
          },
        },
        _disabled: {
          color: 'text.disabled',
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
>
  <slot name="prefix" />
  <slot />
</svelte:element>
