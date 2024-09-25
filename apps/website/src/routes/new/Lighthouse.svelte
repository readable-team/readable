<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { center, flex } from '@readable/styled-system/patterns';

  export let title: string;
</script>

<!-- TODO: animation -->
<div class={flex({ flexDirection: 'column', alignItems: 'center', gap: '14px' })}>
  <div class={center({ position: 'relative', width: '201px', height: '201px' })}>
    <svg fill="none" height="201" viewBox="0 0 201 201" width="201" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100.5" cy="100.5" fill="#EFFBF4" r="92.5" stroke="#0AD266" stroke-width="16" />
    </svg>

    <div
      class={css({
        position: 'absolute',
        top: '[50%]',
        left: '[50%]',
        transform: 'translate(-50%, -50%)',
        fontFamily: 'mono',
        fontWeight: '[600]',
        color: '[#008805]',
        fontSize: '[64px]',
      })}
    >
      100
    </div>
  </div>

  <div class={css({ fontSize: '24px', fontWeight: '[500]', color: 'text.secondary' })}>
    {title}
  </div>
</div>
