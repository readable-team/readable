<script lang="ts">
  import { css, cva, cx } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { getFormContext } from '../forms';
  import Icon from './Icon.svelte';
  import type { RecipeVariant, RecipeVariantProps, SystemStyleObject } from '@readable/styled-system/types';
  import type { ComponentType } from 'svelte';
  import type { HTMLInputAttributes } from 'svelte/elements';

  export let name: string;
  export let value: HTMLInputAttributes['value'] = undefined;
  export let style: SystemStyleObject | undefined = undefined;
  export let size: Variants['size'] = 'lg';
  export let inputEl: HTMLInputElement | undefined = undefined;
  export let leftIcon: ComponentType | undefined = undefined;
  export let rightIcon: ComponentType | undefined = undefined;
  export let hidden = false;

  type $$Props = RecipeVariantProps<typeof recipe> &
    Omit<HTMLInputAttributes, 'class' | 'style' | 'size'> & {
      style?: SystemStyleObject;
      inputEl?: HTMLInputElement;
      leftIcon?: ComponentType;
      rightIcon?: ComponentType;
      hidden?: boolean;
    };

  type $$Events = {
    input: Event & { currentTarget: HTMLInputElement };
    keydown: KeyboardEvent & { currentTarget: HTMLInputElement };
    blur: FocusEvent & { currentTarget: HTMLInputElement };
  };

  const { field } = getFormContext();

  if (field) {
    name = field.name;
  }

  type Variants = RecipeVariant<typeof recipe>;
  const recipe = cva({
    base: {
      display: 'flex',
      alignItems: 'center',
      borderWidth: '1px',
      borderColor: { base: 'gray.300', _dark: 'darkgray.700' },
      color: { base: 'gray.500', _dark: 'darkgray.400' },
      backgroundColor: { base: 'white', _dark: 'darkgray.1000' },
      transition: 'common',
      _hover: {
        borderColor: { base: 'brand.400', _dark: 'brand.300' },
      },
      _hasFocusedInput: {
        borderColor: { base: 'brand.600', _dark: 'brand.500' },
      },
      _hasFilledInput: {
        color: { base: 'gray.1000', _dark: 'darkgray.100' },
        borderColor: { base: 'gray.300', _dark: 'darkgray.700' },
      },
      _hasDisabledInput: {
        color: { base: 'gray.500', _dark: 'darkgray.600' },
        backgroundColor: { base: 'gray.200', _dark: 'darkgray.900' },
        borderColor: { base: 'gray.200', _dark: 'darkgray.700' },
      },
      _hasReadonlyInput: {
        color: 'text.tertiary',
        backgroundColor: { base: 'gray.200', _dark: 'darkgray.900' },
        borderColor: { base: 'gray.200', _dark: 'darkgray.700' },
      },
      _hasInvalidInput: {
        borderColor: { base: 'red.600', _dark: 'red.500' },
        _hasFocusedInput: {
          borderColor: { base: 'red.600', _dark: 'red.500' },
        },
        _hasFilledInput: {
          color: { base: 'gray.1000', _dark: 'darkgray.100' },
          backgroundColor: { base: 'white', _dark: 'darkgray.1000' },
        },
      },
    },
    variants: {
      size: {
        sm: {
          borderRadius: '6px',
          textStyle: '14r',
          height: '32px',
          paddingX: '12px',
        },
        md: {
          borderRadius: '8px',
          textStyle: '14m',
          height: '38px',
          paddingX: '12px',
        },
        lg: {
          borderRadius: '10px',
          textStyle: '16r',
          height: '43px',
          paddingX: '16px',
        },
      },
    },
  });
</script>

<label class={cx(recipe({ size }), css(style))} for={name} {hidden}>
  {#if leftIcon}
    <div class={flex({ align: 'center', marginRight: '8px' })}>
      <Icon icon={leftIcon} size={18} />
    </div>
  {/if}

  {#if 'left-item' in $$slots}
    <div class={css({ marginRight: '8px' })}>
      <slot name="left-item" />
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
