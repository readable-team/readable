<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
</script>

<h2
  class={flex({
    flexDirection: 'column',
    gap: '16px',
    lgDown: {
      gap: '10px',
    },
  })}
>
  <div
    class={css({
      fontSize: '20px',
      fontWeight: '[600]',
      lgDown: {
        fontSize: '13px',
      },
    })}
  >
    <slot name="subtitle" />
  </div>

  <h1
    class={css({
      fontSize: '[45px]',
      fontWeight: '[800]',
      lineHeight: '[138%]',
      lgDown: {
        fontSize: '24px',
        marginTop: '2px',
      },
    })}
  >
    <slot name="title" />
  </h1>

  <p
    class={css({
      fontSize: '0',
      '& > * > span': {
        fontSize: '20px',
        fontWeight: '[500]',
        color: 'text.tertiary',
        lgDown: {
          fontSize: '14px',
        },
      },
      '& > * > em': {
        fontSize: '20px',
        fontWeight: '[700]',
        color: 'text.primary',
        lgDown: {
          fontSize: '14px',
        },
      },
    })}
  >
    <slot name="description" />
  </p>
</h2>
