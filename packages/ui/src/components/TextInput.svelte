<script lang="ts">
  import { css, cva, cx } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import InfoIcon from '~icons/lucide/info';
  import Icon from './Icon.svelte';
  import type { RecipeVariant, RecipeVariantProps, SystemStyleObject } from '@readable/styled-system/types';
  import type { ComponentType } from 'svelte';
  import type { HTMLInputAttributes } from 'svelte/elements';

  export let name: HTMLInputAttributes['name'] = undefined;
  export let value: HTMLInputAttributes['value'] = undefined;
  export let style: SystemStyleObject | undefined = undefined;
  export let size: Variants['size'] = 'lg';
  export let inputEl: HTMLInputElement | undefined = undefined;
  export let leftIcon: ComponentType | undefined = undefined;
  export let rightIcon: ComponentType | undefined = undefined;
  export let error: boolean | undefined = undefined;
  export let message: string | undefined = undefined;
  export let hidden = false;

  type $$Props = RecipeVariantProps<typeof recipe> &
    Omit<HTMLInputAttributes, 'class' | 'style' | 'size'> & {
      style?: SystemStyleObject;
      inputEl?: HTMLInputElement;
      leftIcon?: ComponentType;
      rightIcon?: ComponentType;
      error?: boolean;
      message?: string;
      hidden?: boolean;
    };
  type $$Events = {
    input: Event & { currentTarget: HTMLInputElement };
    keydown: KeyboardEvent & { currentTarget: HTMLInputElement };
    blur: FocusEvent & { currentTarget: HTMLInputElement };
  };

  type Variants = RecipeVariant<typeof recipe>;
  const recipe = cva({
    base: {
      'display': 'flex',
      'alignItems': 'center',
      'borderWidth': '1px',
      'padding': '10px',
      'transition': 'common',
      'color': { base: 'gray.500', _dark: 'darkgray.400' },
      'borderColor': { base: 'gray.200', _dark: 'darkgray.200' },
      'backgroundColor': { base: 'white', _dark: 'darkgray.1000' },
      'outlineColor': 'transparent',
      '& input::placeholder': {
        color: { base: 'gray.500', _dark: 'darkgray.400' },
      },
      '_hover': {
        color: { base: 'gray.500', _dark: 'darkgray.400' },
        backgroundColor: { base: 'white', _dark: 'darkgray.1000' },
        borderColor: { base: 'gray.200', _dark: 'darkgray.200' },
        outlineColor: { base: 'gray.300', _dark: 'darkgray.600' },
      },
      '_hasFocusedInput': {
        color: { base: 'gray.1000', _dark: 'darkgray.100' },
        backgroundColor: { base: 'white', _dark: 'darkgray.1000' },
        borderColor: { base: 'gray.1000', _dark: 'darkgray.100' },
        outlineColor: { base: 'gray.300', _dark: 'darkgray.600' },
      },
      '_hasFilledInput': {
        color: { base: 'gray.1000', _dark: 'darkgray.100' },
        backgroundColor: { base: 'white', _dark: 'darkgray.1000' },
        borderColor: { base: 'gray.1000', _dark: 'darkgray.100' },
        outlineColor: 'transparent',
      },
      '_hasDisabledInput': {
        'color': { base: 'gray.500', _dark: 'darkgray.600' },
        'backgroundColor': { base: 'gray.200', _dark: 'darkgray.900' },
        'borderColor': { base: 'gray.300', _dark: 'darkgray.800' },
        'outlineColor': 'transparent',
        '& input::placeholder': {
          color: { base: 'gray.500', _dark: 'darkgray.600' },
        },
      },
    },
    variants: {
      size: {
        lg: {
          outlineWidth: '4px',
          borderRadius: '10px',
          textStyle: '16r',
          height: '48px',
        },
        md: {
          outlineWidth: '3px',
          borderRadius: '8px',
          textStyle: '14r',
          height: '38px',
        },
      },
      error: {
        true: {
          'color': { base: 'red.600', _dark: 'red.500' },
          'borderColor': { base: 'red.600', _dark: 'red.500' },
          'backgroundColor': { base: 'red.100', _dark: 'red.900' },
          'outlineColor': 'transparent',
          '& input::placeholder': {
            color: { base: 'red.600', _dark: 'red.500' },
          },
          '_hover': {
            color: { base: 'red.600', _dark: 'red.500' },
            backgroundColor: { base: 'red.100', _dark: 'red.900' },
            borderColor: { base: 'red.600', _dark: 'red.500' },
            outlineColor: { base: 'red.300', _dark: 'red.800' },
          },
          '_hasFocusedInput': {
            color: { base: 'gray.1000', _dark: 'darkgray.100' },
            backgroundColor: { base: 'white', _dark: 'darkgray.1000' },
            borderColor: { base: 'red.600', _dark: 'red.500' },
            outlineColor: { base: 'red.300', _dark: 'red.800' },
          },
          '_hasFilledInput': {
            color: { base: 'gray.1000', _dark: 'darkgray.100' },
            backgroundColor: { base: 'white', _dark: 'darkgray.1000' },
            borderColor: { base: 'red.600', _dark: 'darkgray.100' },
            outlineColor: 'transparent',
          },
          '_hasDisabledInput': {
            'color': { base: 'gray.500', _dark: 'darkgray.600' },
            'backgroundColor': { base: 'gray.200', _dark: 'darkgray.900' },
            'borderColor': { base: 'gray.300', _dark: 'darkgray.800' },
            'outlineColor': 'transparent',
            '& input::placeholder': {
              color: { base: 'gray.500', _dark: 'darkgray.600' },
            },
          },
        },
      },
    },
  });

  const messageRecipe = cva({
    base: {
      display: 'flex',
      alignItems: 'center',
      gap: '3px',
      textStyle: '12r',
      marginTop: '4px',
    },
    variants: {
      error: {
        true: {
          color: { base: 'red.600', _dark: 'red.500' },
        },
        false: {
          color: { base: 'gray.700', _dark: 'darkgray.700' },
        },
      },
    },
  });
</script>

<label class={cx(recipe({ size, error }), css(style))} for={name} {hidden}>
  {#if leftIcon}
    <div class={flex({ align: 'center', marginRight: '8px' })}>
      <Icon icon={leftIcon} size={18} />
    </div>
  {/if}

  <input
    bind:this={inputEl}
    id={name}
    {name}
    class={css({ flexGrow: '1', width: 'full', minWidth: '0' })}
    type="text"
    on:input
    on:keydown
    on:blur
    bind:value
    {...$$restProps}
    aria-live={value ? 'polite' : 'off'}
  />

  {#if rightIcon}
    <div class={flex({ align: 'center', marginLeft: '20px' })}>
      <Icon icon={rightIcon} size={18} />
    </div>
  {/if}
</label>
{#if message}
  <div class={cx(messageRecipe({ error }))}>
    <Icon icon={InfoIcon} size={12} />
    {message}
  </div>
{/if}
