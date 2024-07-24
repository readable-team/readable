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
      'color': 'text-field.foreground.primary-inactive',
      'borderColor': 'text-field.border.primary-inactive',
      'backgroundColor': 'text-field.background.primary-inactive',
      'outlineColor': 'text-field.outline.primary-inactive',
      '& input::placeholder': {
        color: 'text-field.foreground.primary-inactive',
      },
      '_hover': {
        color: 'text-field.foreground.primary-hover',
        backgroundColor: 'text-field.background.primary-hover',
        borderColor: 'text-field.border.primary-hover',
        outlineColor: 'text-field.outline.primary-hover',
      },
      '_hasFocusedInput': {
        color: 'text-field.foreground.primary-active',
        backgroundColor: 'text-field.background.primary-active',
        borderColor: 'text-field.border.primary-active',
        outlineColor: 'text-field.outline.primary-active',
      },
      '_hasFilledInput': {
        color: 'text-field.foreground.primary-filled',
        backgroundColor: 'text-field.background.primary-filled',
        borderColor: 'text-field.border.primary-filled',
        outlineColor: 'text-field.outline.primary-filled',
      },
      '_hasDisabledInput': {
        'color': 'text-field.foreground.primary-disabled',
        'backgroundColor': 'text-field.background.primary-disabled',
        'borderColor': 'text-field.border.primary-disabled',
        'outlineColor': 'text-field.outline.primary-disabled',
        '& input::placeholder': {
          color: 'text-field.foreground.danger-disabled',
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
          'color': 'text-field.foreground.danger-inactive',
          'borderColor': 'text-field.border.danger-inactive',
          'backgroundColor': 'text-field.background.danger-inactive',
          'outlineColor': 'text-field.outline.danger-inactive',
          '& input::placeholder': {
            color: 'text-field.foreground.danger-inactive',
          },
          '_hover': {
            color: 'text-field.foreground.danger-hover',
            backgroundColor: 'text-field.background.danger-hover',
            borderColor: 'text-field.border.danger-hover',
            outlineColor: 'text-field.outline.danger-hover',
          },
          '_hasFocusedInput': {
            color: 'text-field.foreground.danger-active',
            backgroundColor: 'text-field.background.danger-active',
            borderColor: 'text-field.border.danger-active',
            outlineColor: 'text-field.outline.danger-active',
          },
          '_hasFilledInput': {
            color: 'text-field.foreground.danger-filled',
            backgroundColor: 'text-field.background.danger-filled',
            borderColor: 'text-field.border.danger-filled',
            outlineColor: 'text-field.outline.danger-filled',
          },
          '_hasDisabledInput': {
            'color': 'text-field.foreground.danger-disabled',
            'backgroundColor': 'text-field.background.danger-disabled',
            'borderColor': 'text-field.border.danger-disabled',
            'outlineColor': 'text-field.outline.danger-disabled',
            '& input::placeholder': {
              color: 'text-field.foreground.danger-disabled',
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
          color: 'text-field.message.error',
        },
        false: {
          color: 'text-field.message',
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
