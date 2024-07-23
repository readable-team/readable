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
  export let variant: Variants['variant'] = 'accent';
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
      backgroundColor: { _disabled: 'gray.150' },
      pointerEvents: { _disabled: 'none', _busy: 'none' },
    },
    variants: {
      variant: {
        accent: {
          color: 'text.main1',
          backgroundColor: {
            _enabled: {
              base: 'surface.button.primary',
              _hover: 'surface.button.primary.hover',
              _focusVisible: 'surface.button.primary.hover',
              _active: 'surface.button.primary.pressed',
              _pressed: 'surface.button.primary.pressed',
            },
            _disabled: 'surface.disabled',
          },
        },
        secondary: {
          color: {
            _enabled: {
              base: 'text.button.sub.primary',
              _hover: 'text.button.sub.hover',
              _focusVisible: 'text.button.sub.hover',
              _active: 'text.button.sub.pressed',
              _pressed: 'text.button.sub.pressed',
            },
            _disabled: 'text.disabled',
          },
          backgroundColor: 'surface.button.sub.main',
          outlineWidth: '1px',
          outlineColor: 'border.sub2',
        },
        danger: {
          color: 'text.main1',
          backgroundColor: {
            _enabled: {
              base: 'surface.button.danger',
              _hover: 'surface.button.danger.hover',
              _focusVisible: 'surface.button.danger.hover',
              _active: 'surface.button.danger.pressed',
              _pressed: 'surface.button.danger.pressed',
            },
            _disabled: 'surface.disabled',
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
      <RingSpinner style={css.raw({ height: 'full', color: variant === 'secondary' ? 'text.main4' : 'text.main1' })} />
    </div>
  {/if}
  <div class={css({ display: 'contents' }, showSpinner && { visibility: 'hidden' })}>
    <slot />
  </div>
</svelte:element>
