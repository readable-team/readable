<script generics="T extends 'button' | 'reset' | 'submit' | 'link' = 'button'" lang="ts">
  import { css, cva } from '@readable/styled-system/css';
  import { center } from '@readable/styled-system/patterns';
  import { getFormContext } from '../forms';
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

  export let type: 'button' | 'reset' | 'submit' | 'link' = 'button';

  export let style: SystemStyleObject | undefined = undefined;

  export let disabled = false;
  export let loading = false;
  export let variant: Variants['variant'] = 'primary';
  export let size: Variants['size'] = 'md';

  export let external = false;

  $: element = type === 'link' ? 'a' : 'button';

  const { isSubmitting } = getFormContext().form ?? {};

  $: showSpinner = !!(loading || (type === 'submit' && $isSubmitting));
  $: props = type === 'link' ? ({ 'aria-disabled': disabled ? 'true' : 'false' } as const) : { type, disabled };

  type Variants = RecipeVariant<typeof recipe>;
  const recipe = cva({
    base: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      outlineOffset: '0',
      userSelect: 'none',
      pointerEvents: { _disabled: 'none', _busy: 'none' },
    },
    variants: {
      variant: {
        'primary': {
          color: {
            _enabled: {
              base: { base: 'white', _dark: 'white' },
              _hover: { base: 'white', _dark: 'white' },
              _focusVisible: { base: 'white', _dark: 'white' },
              _active: { base: 'white', _dark: 'white' },
              _pressed: { base: 'white', _dark: 'white' },
            },
            _disabled: { base: 'gray.500', _dark: 'darkgray.700' },
          },
          backgroundColor: {
            _enabled: {
              base: { base: 'brand.600', _dark: 'brand.500' },
              _hover: { base: 'brand.500', _dark: 'brand.400' },
              _focusVisible: { base: 'brand.500', _dark: 'brand.400' },
              _active: { base: 'brand.700', _dark: 'brand.600' },
              _pressed: { base: 'brand.700', _dark: 'brand.600' },
            },
            _disabled: { base: 'gray.200', _dark: 'darkgray.900' },
          },
        },
        'secondary': {
          color: {
            _enabled: {
              base: { base: 'gray.700', _dark: 'darkgray.200' },
              _hover: { base: 'gray.700', _dark: 'darkgray.200' },
              _focusVisible: { base: 'gray.700', _dark: 'darkgray.200' },
              _active: { base: 'gray.700', _dark: 'darkgray.200' },
              _pressed: { base: 'gray.700', _dark: 'darkgray.200' },
            },
            _disabled: { base: 'gray.500', _dark: 'darkgray.700' },
          },
          backgroundColor: {
            _enabled: {
              base: { base: 'white', _dark: 'darkgray.1000' },
              _hover: { base: 'gray.100', _dark: 'darkgray.1000' },
              _focusVisible: { base: 'gray.100', _dark: 'darkgray.1000' },
              _active: { base: 'gray.300', _dark: 'darkgray.1000' },
              _pressed: { base: 'gray.300', _dark: 'darkgray.1000' },
            },
            _disabled: { base: 'gray.200', _dark: 'darkgray.900' },
          },
          borderWidth: '1px',
          borderColor: {
            _enabled: { base: 'gray.300', _dark: 'darkgray.700' },
            _disabled: { base: 'gray.200', _dark: 'darkgray.900' },
          },
        },
        'danger-fill': {
          color: {
            _enabled: {
              base: { base: 'red.700', _dark: 'red.600' },
              _hover: { base: 'red.700', _dark: 'red.600' },
              _focusVisible: { base: 'red.700', _dark: 'red.600' },
              _active: { base: 'red.700', _dark: 'red.600' },
              _pressed: { base: 'red.700', _dark: 'red.600' },
            },
            _disabled: { base: 'gray.500', _dark: 'darkgray.700' },
          },
          backgroundColor: {
            _enabled: {
              base: { base: 'red.100', _dark: 'red.800/20' },
              _hover: { base: 'red.200', _dark: 'red.800/40' },
              _focusVisible: { base: 'red.200', _dark: 'red.800/40' },
              _active: { base: 'red.300', _dark: 'red.800/60' },
              _pressed: { base: 'red.300', _dark: 'red.800/60' },
            },
            _disabled: { base: 'gray.200', _dark: 'darkgray.900' },
          },
          borderWidth: '1px',
          borderColor: {
            _enabled: { base: 'red.200', _dark: 'red.800' },
            _disabled: { base: 'gray.200', _dark: 'darkgray.900' },
          },
        },
      },
      size: {
        sm: { borderRadius: '6px', paddingX: '14px', paddingY: '[6.5px]', textStyle: '14b', height: '32px' },
        md: { borderRadius: '8px', paddingX: '20px', paddingY: '9px', textStyle: '14b', height: '38px' },
        lg: { borderRadius: '10px', paddingX: '30px', paddingY: '10px', textStyle: '16b', height: '43px' },
      },
    },
  });

  const spinnerRecipe = cva({
    base: {
      height: 'full',
    },
    variants: {
      color: {
        'primary': { color: { base: 'white', _dark: 'white' } },
        'secondary': { color: { base: 'gray.700', _dark: 'darkgray.800' } },
        'danger-fill': { color: { base: 'red.700', _dark: 'red.600' } },
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
