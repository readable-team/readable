<script generics="T extends 'button' | 'submit' | 'link' = 'button'" lang="ts">
  import { css, cva } from '@readable/styled-system/css';
  import { center } from '@readable/styled-system/patterns';
  import RingSpinner from './RingSpinner.svelte';
  import type { RecipeVariant, RecipeVariantProps } from '@readable/styled-system/css';
  import type { SystemStyleObject } from '@readable/styled-system/types';
  import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';

  type $$Props = RecipeVariantProps<typeof recipe> & {
    type?: T;
    loading?: boolean;
    style?: SystemStyleObject;
    disabled?: boolean;
  } & Omit<
      T extends 'link'
        ? HTMLAnchorAttributes & { external?: boolean }
        : Omit<HTMLButtonAttributes, 'type' | 'disabled'>,
      'class' | 'style'
    >;

  type $$Events = T extends 'link' ? unknown : { click: MouseEvent };

  export let type: 'button' | 'submit' | 'link' = 'button';

  export let style: SystemStyleObject | undefined = undefined;

  export let disabled = false;
  export let loading = false;
  export let variant: Variants['variant'] = 'primary';
  export let size: Variants['size'] = 'md';

  export let external = false;

  $: element = type === 'link' ? 'a' : 'button';

  $: showSpinner = loading;
  $: props = type === 'link' ? ({ 'aria-disabled': disabled ? 'true' : 'false' } as const) : { type, disabled };

  type Variants = RecipeVariant<typeof recipe>;
  const recipe = cva({
    base: {
      textAlign: 'center',
      outlineOffset: '0',
      userSelect: 'none',
      pointerEvents: { _disabled: 'none', _busy: 'none' },
    },
    variants: {
      variant: {
        primary: {
          color: {
            _enabled: {
              base: 'button.foreground.primary',
              _hover: 'button.foreground.primary-hover',
              _focusVisible: 'button.foreground.primary-hover',
              _active: 'button.foreground.primary-pressed',
              _pressed: 'button.foreground.primary-pressed',
            },
            _disabled: 'button.foreground.primary-disabled',
          },
          backgroundColor: {
            _enabled: {
              base: 'button.background.primary',
              _hover: 'button.background.primary-hover',
              _focusVisible: 'button.background.primary-hover',
              _active: 'button.background.primary-pressed',
              _pressed: 'button.background.primary-pressed',
            },
            _disabled: 'button.background.primary-disabled',
          },
        },
        secondary: {
          color: {
            _enabled: {
              base: 'button.foreground.secondary',
              _hover: 'button.foreground.secondary-hover',
              _focusVisible: 'button.foreground.secondary-hover',
              _active: 'button.foreground.secondary-pressed',
              _pressed: 'button.foreground.secondary-pressed',
            },
            _disabled: 'button.foreground.secondary-disabled',
          },
          backgroundColor: {
            _enabled: {
              base: 'button.background.secondary',
              _hover: 'button.background.secondary-hover',
              _focusVisible: 'button.background.secondary-hover',
              _active: 'button.background.secondary-pressed',
              _pressed: 'button.background.secondary-pressed',
            },
            _disabled: 'button.background.secondary-disabled',
          },
          outlineWidth: '1px',
          outlineColor: 'button.border.secondary',
        },
        danger: {
          color: {
            _enabled: {
              base: 'button.foreground.danger',
              _hover: 'button.foreground.danger-hover',
              _focusVisible: 'button.foreground.danger-hover',
              _active: 'button.foreground.danger-pressed',
              _pressed: 'button.foreground.danger-pressed',
            },
            _disabled: 'button.foreground.danger-disabled',
          },
          backgroundColor: {
            _enabled: {
              base: 'button.background.danger',
              _hover: 'button.background.danger-hover',
              _focusVisible: 'button.background.danger-hover',
              _active: 'button.background.danger-pressed',
              _pressed: 'button.background.danger-pressed',
            },
            _disabled: 'button.background.danger-disabled',
          },
        },
      },
      size: {
        sm: { borderRadius: '6px', paddingX: '14px', paddingY: '[7.5px]', textStyle: '13b' },
        md: { borderRadius: '8px', paddingX: '20px', paddingY: '9px', textStyle: '15b' },
        lg: { borderRadius: '10px', paddingX: '30px', paddingY: '[12.5px]', textStyle: '16b' },
      },
    },
  });

  const spinnerRecipe = cva({
    base: {
      height: 'full',
    },
    variants: {
      color: {
        primary: { color: 'button.foreground.primary' },
        secondary: { color: 'button.foreground.secondary' },
        danger: { color: 'button.foreground.danger' },
      },
    },
  });
</script>

<svelte:element
  this={element}
  class={css(recipe.raw({ variant, size }), showSpinner && { position: 'relative' }, style)}
  aria-busy={showSpinner}
  role="button"
  tabindex="0"
  on:click
  {...$$restProps}
  {...props}
  {...external && {
    target: '_blank',
    rel: 'noopener noreferrer',
  }}
>
  {#if showSpinner}
    <div class={center({ position: 'absolute', inset: '0', padding: '[inherit]' })}>
      <RingSpinner style={spinnerRecipe.raw({ color: variant })} />
    </div>
  {/if}
  <div class={css({ display: 'contents' }, showSpinner && { visibility: 'hidden' })}>
    <slot />
  </div>
</svelte:element>
