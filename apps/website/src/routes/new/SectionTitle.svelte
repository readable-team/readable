<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
</script>

<h2
  class={flex({
    flexDirection: 'column',
    gap: '16px',
  })}
>
  <!-- 20px 600 subtitle -->
  <div
    class={css({
      fontSize: '20px',
      fontWeight: '[600]',
    })}
  >
    <slot name="subtitle" />
  </div>

  <!-- 45px 800 title -->
  <h1
    class={css({
      fontSize: '[45px]',
      fontWeight: '[800]',
      lineHeight: '[138%]',
    })}
  >
    <slot name="title" />
  </h1>

  <!-- 20px 500 description -->
  <p
    class={css({
      'fontSize': '0',
      '& > * > span': {
        fontSize: '20px',
        fontWeight: '[500]',
        color: 'text.tertiary',
      },
      '& > * > em': {
        fontSize: '20px',
        fontWeight: '[700]',
        color: 'text.primary',
      },
    })}
  >
    <slot name="description" />
  </p>
</h2>
