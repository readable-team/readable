<script lang="ts">
  import { css, cva } from '@readable/styled-system/css';
  import type { RecipeVariantProps } from '@readable/styled-system/css';
  import type { RecipeVariant, SystemStyleObject } from '@readable/styled-system/types';
  import type { HTMLInputAttributes } from 'svelte/elements';

  type $$Events = {
    change: Event & { currentTarget: HTMLInputElement };
  };

  type $$Props = Omit<HTMLInputAttributes, 'size' | 'style'> &
    RecipeVariantProps<typeof recipe> & {
      style?: SystemStyleObject;
    };

  type Variants = RecipeVariant<typeof recipe>;
  export let size: Variants['size'] = 'lg';

  export let style: SystemStyleObject | undefined = undefined;
  export let checked: boolean | null | undefined = undefined;

  const recipe = cva({
    base: {
      position: 'relative',
      display: 'flex',
      justifyContent: { base: 'flex-start', _checked: 'flex-end' },
      alignItems: 'center',
      borderRadius: 'full',
      aspectRatio: '[2/1]',
      backgroundColor: { base: 'neutral.20', _checked: 'brand.600' },
      transition: 'common',
      appearance: 'none',
      cursor: 'pointer',
      _after: {
        content: '""',
        borderRadius: 'full',
        height: 'full',
        aspectRatio: '1/1',
        backgroundColor: 'white',
      },
      _disabled: {
        backgroundColor: 'neutral.20!',
        cursor: 'not-allowed',
        _after: { backgroundColor: 'neutral.40' },
      },
    },
    variants: {
      size: {
        sm: { width: '36px', height: '18px', padding: '2px', borderRadius: 'full' },
        lg: { width: '40px', height: '20px', padding: '2px', borderRadius: 'full' },
      },
    },
  });
</script>

<label class={css(style)} for={$$restProps['name']}>
  <slot />
  <input id={$$restProps['name']} class={recipe({ size })} type="checkbox" on:change bind:checked {...$$restProps} />
</label>
