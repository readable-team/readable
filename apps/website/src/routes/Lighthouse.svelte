<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { center, flex } from '@readable/styled-system/patterns';
  import { onMount } from 'svelte';
  import { quintOut } from 'svelte/easing';
  import { tweened } from 'svelte/motion';
  import { derived } from 'svelte/store';

  export let title: string;

  let containerEl: HTMLDivElement;

  const circumference = 2 * Math.PI * 45;

  const progress = tweened(0, { duration: 2000, easing: quintOut });
  const value = derived(progress, ($progress) => Math.round($progress * 100));
  const color = derived(progress, ($progress) =>
    $progress > 0.9 ? '#00CC66' : $progress > 0.5 ? '#FFAA33' : '#FF3333',
  );
  const secondaryColor = derived(progress, ($progress) =>
    $progress > 0.9 ? '#008800' : $progress > 0.5 ? '#C33300' : '#CC0000',
  );

  onMount(() => {
    if (containerEl) {
      const observer = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          progress.set(1);
        }
      });

      observer.observe(containerEl);

      return () => observer.disconnect();
    }
  });
</script>

<!-- TODO: animation -->
<div bind:this={containerEl} class={flex({ flexDirection: 'column', alignItems: 'center', gap: '14px', flex: '1' })}>
  <div
    class={center({
      position: 'relative',
      width: 'full',
      height: 'full',
      maxWidth: '201px',
      maxHeight: '201px',
    })}
  >
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle
        class={css({
          transitionProperty: 'stroke, fill',
          transitionDuration: '250ms',
          transitionTimingFunction: 'ease',
        })}
        cx="50"
        cy="50"
        fill={`${$color}1A`}
        r="45"
        stroke={$color}
        stroke-dasharray={circumference}
        stroke-dashoffset={circumference * (1 - $progress)}
        stroke-linecap="round"
        stroke-width="10"
        transform="rotate(-90 50 50)"
      />
    </svg>

    <div
      style:color={$secondaryColor}
      class={css({
        position: 'absolute',
        top: '[50%]',
        left: '[50%]',
        transform: 'translate(-50%, -50%)',
        fontFamily: 'mono',
        fontWeight: '[600]',
        fontSize: '[64px]',
        transitionProperty: 'color',
        transitionDuration: '250ms',
        transitionTimingFunction: 'ease',
        lgDown: {
          fontSize: '24px',
        },
      })}
    >
      {$value}
    </div>
  </div>

  <div
    class={css({
      fontSize: '24px',
      fontWeight: '[500]',
      color: 'text.secondary',
      lgDown: {
        fontSize: '12px',
      },
    })}
  >
    {title}
  </div>
</div>
