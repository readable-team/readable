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
    glossy?: boolean;
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
  export let glossy = false;

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
        primary: {
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
        secondary: {
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
              base: { base: 'white', _dark: 'darkgray.800' },
              _hover: { base: 'gray.100', _dark: 'darkgray.700' },
              _focusVisible: { base: 'gray.100', _dark: 'darkgray.700' },
              _active: { base: 'gray.300', _dark: 'darkgray.900' },
              _pressed: { base: 'gray.300', _dark: 'darkgray.900' },
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
              base: { base: 'red.600', _dark: 'red.500' },
              _hover: { base: 'red.500', _dark: 'red.400' },
              _focusVisible: { base: 'red.500', _dark: 'red.400' },
              _active: { base: 'red.700', _dark: 'red.600' },
              _pressed: { base: 'red.700', _dark: 'red.600' },
            },
            _disabled: { base: 'gray.200', _dark: 'darkgray.900' },
          },
        },
      },
      size: {
        sm: { borderRadius: '6px', paddingX: '14px', paddingY: '6px', textStyle: '14sb', height: '32px' },
        md: { borderRadius: '8px', paddingX: '20px', paddingY: '9px', textStyle: '14sb', height: '38px' },
        lg: { borderRadius: '10px', paddingX: '30px', paddingY: '10px', textStyle: '16sb', height: '43px' },
      },
    },
  });

  const spinnerRecipe = cva({
    base: {
      height: 'full',
    },
    variants: {
      color: {
        primary: { color: { base: 'white', _dark: 'white' } },
        secondary: { color: { base: 'gray.700', _dark: 'darkgray.800' } },
        'danger-fill': { color: { base: 'red.700', _dark: 'red.600' } },
      },
    },
  });
</script>

<svelte:element
  this={element}
  class={css(recipe.raw({ variant, size }), (showSpinner || glossy) && { position: 'relative' }, style)}
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
  {#if glossy && !disabled}
    <div
      class={cva({
        base: {
          position: 'absolute',
          top: '0',
          left: '0',
          size: 'full',
          bgGradient: 'to-r',
          gradientFrom: 'white/20',
          gradientTo: 'white/0',
          pointerEvents: 'none',
        },
        variants: {
          size: {
            sm: { borderRadius: '6px' },
            md: { borderRadius: '8px' },
            lg: { borderRadius: '10px' },
          },
        },
      })({ size })}
    />
  {/if}
</svelte:element>
