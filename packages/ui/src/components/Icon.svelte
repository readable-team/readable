<script lang="ts">
  import { css, cva } from '@readable/styled-system/css';
  import type { RecipeVariant, SystemStyleObject } from '@readable/styled-system/types';
  import type { ComponentType } from 'svelte';

  type Variants = RecipeVariant<typeof recipe>;

  export let icon: ComponentType;
  export let style: SystemStyleObject | undefined = undefined;
  export let size: Variants['size'] = 16;

  const recipe = cva({
    base: {
      'display': 'block',
      'verticalAlign': 'middle',
      'flex': 'none',
      'transition': 'common',
      '& *': { strokeWidth: '[2]' },
    },
    variants: {
      size: {
        12: { size: '12px' },
        14: { size: '14px' },
        16: { size: '16px' },
        18: { size: '18px' },
        20: { size: '20px' },
        24: { size: '24px' },
        28: { size: '28px' },
        32: { size: '32px' },
      },
    },
  });

  $: baseStyle = recipe.raw({ size });
</script>

<svelte:component this={icon} class={css(baseStyle, style)} />
