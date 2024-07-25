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
  export let leftIcon: ComponentType;
  export let rightIcon: ComponentType;
  export let error: boolean;
  export let message: string;
  export let hidden = false;

  type $$Props = RecipeVariantProps<typeof recipe> &
    Omit<HTMLInputAttributes, 'class' | 'style' | 'size'> & {
      style?: SystemStyleObject;
      inputEl?: HTMLInputElement;
      leftIcon: ComponentType;
      rightIcon: ComponentType;
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
      'borderRadius': '10px',
      'transition': 'common',
      'outlineWidth': '4px',
      'color': 'text-input.foreground.primary-inactive',
      'borderColor': 'text-input.border.primary-inactive',
      'backgroundColor': 'text-input.background.primary-inactive',
      'outlineColor': 'text-input.outline.primary-inactive',
      '& input::placeholder': {
        color: 'text-input.foreground.primary-inactive',
      },
      '_hover': {
        color: 'text-input.foreground.primary-hover',
        backgroundColor: 'text-input.background.primary-hover',
        borderColor: 'text-input.border.primary-hover',
        outlineColor: 'text-input.outline.primary-hover',
      },
      '_hasFocusedInput': {
        color: 'text-input.foreground.primary-active',
        backgroundColor: 'text-input.background.primary-active',
        borderColor: 'text-input.border.primary-active',
        outlineColor: 'text-input.outline.primary-active',
      },
      '_hasFilledInput': {
        color: 'text-input.foreground.primary-filled',
        backgroundColor: 'text-input.background.primary-filled',
        borderColor: 'text-input.border.primary-filled',
        outlineColor: 'text-input.outline.primary-filled',
      },
      '_hasDisabledInput': {
        'color': 'text-input.foreground.primary-disabled',
        'backgroundColor': 'text-input.background.primary-disabled',
        'borderColor': 'text-input.border.primary-disabled',
        'outlineColor': 'text-input.outline.primary-disabled',
        '& input::placeholder': {
          color: 'text-input.foreground.danger-disabled',
        },
      },
    },
    variants: {
      size: {
        lg: {
          paddingX: '16px',
          paddingY: '[12.5px]',
          textStyle: '16r',
          height: '48px',
        },
      },
      error: {
        true: {
          'color': 'text-input.foreground.danger-inactive',
          'borderColor': 'text-input.border.danger-inactive',
          'backgroundColor': 'text-input.background.danger-inactive',
          'outlineColor': 'text-input.outline.danger-inactive',
          '& input::placeholder': {
            color: 'text-input.foreground.danger-inactive',
          },
          '_hover': {
            color: 'text-input.foreground.danger-hover',
            backgroundColor: 'text-input.background.danger-hover',
            borderColor: 'text-input.border.danger-hover',
            outlineColor: 'text-input.outline.danger-hover',
          },
          '_hasFocusedInput': {
            color: 'text-input.foreground.danger-active',
            backgroundColor: 'text-input.background.danger-active',
            borderColor: 'text-input.border.danger-active',
            outlineColor: 'text-input.outline.danger-active',
          },
          '_hasFilledInput': {
            color: 'text-input.foreground.danger-filled',
            backgroundColor: 'text-input.background.danger-filled',
            borderColor: 'text-input.border.danger-filled',
            outlineColor: 'text-input.outline.danger-filled',
          },
          '_hasDisabledInput': {
            'color': 'text-input.foreground.danger-disabled',
            'backgroundColor': 'text-input.background.danger-disabled',
            'borderColor': 'text-input.border.danger-disabled',
            'outlineColor': 'text-input.outline.danger-disabled',
            '& input::placeholder': {
              color: 'text-input.foreground.danger-disabled',
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
          color: 'text-input.message.error',
        },
        false: {
          color: 'text-input.message',
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
