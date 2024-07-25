<script lang="ts">
  import { css, cva } from '@readable/styled-system/css';
  import placeholderSvg from '../../assets/logo-placeholder.svg';

  export let size: 20 | 32;

  const recipe = cva({
    base: {
      borderRadius: '4px',
      borderWidth: '1px',
      borderColor: 'border.primary',
      overflow: 'hidden',
    },
    variants: {
      size: {
        20: { width: '20px', height: '20px' },
        32: { width: '32px', height: '32px' },
      },
    },
  });
</script>

<div class={css(recipe.raw({ size }))}>
  <img
    class={css({
      display: 'block',
      width: 'full',
      height: 'full',
    })}
    alt=""
    src={placeholderSvg}
  />
</div>
