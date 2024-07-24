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
      display: 'block',
      verticalAlign: 'middle',
      flex: 'none',
      transition: 'common',
    },
    variants: {
      size: {
        12: { 'size': '12px', '& *': { strokeWidth: '[1.5]' } },
        16: { 'size': '16px', '& *': { strokeWidth: '[1.5]' } },
        18: { 'size': '18px', '& *': { strokeWidth: '[1.5]' } },
        20: { 'size': '20px', '& *': { strokeWidth: '[1.5]' } },
        24: { 'size': '24px', '& *': { strokeWidth: '[1.5]' } },
        28: { 'size': '28px', '& *': { strokeWidth: '[2]' } },
        32: { 'size': '32px', '& *': { strokeWidth: '[2]' } },
      },
    },
  });

  $: baseStyle = recipe.raw({ size });
</script>

<svelte:component this={icon} class={css(baseStyle, style)} />
