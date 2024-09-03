<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { expoInOut, linear } from 'svelte/easing';
  import { tweened } from 'svelte/motion';
  import { fade } from 'svelte/transition';
  import { store } from './store';
  import type { Toast } from './store';

  export let toast: Toast;

  const dismiss = () => store.update((v) => v.filter((t) => t.id !== toast.id));
  const progress = tweened(100, { duration: toast.duration, easing: linear });

  $: if ($progress === 0) {
    dismiss();
  }
</script>

<div
  class={css({
    display: 'flex',
    alignItems: 'center',
    borderRadius: '8px',
    paddingX: '18px',
    paddingY: '12px',
    color: { base: 'white', _dark: 'darkgray.1000' },
    width: 'fit',
    minWidth: '320px',
    maxWidth: '420px',
    backgroundColor: { base: 'gray.800', _dark: 'darkgray.200' },
    overflow: 'hidden',
    pointerEvents: 'auto',
  })}
  on:introend={() => ($progress = 0)}
  in:fade={{ duration: 400, delay: 300, easing: expoInOut }}
  out:fade={{ duration: 400, delay: 200, easing: expoInOut }}
>
  <span class={css({ textStyle: '14sb', textAlign: 'center', wordBreak: 'break-all' })}>
    {toast.message}
  </span>
</div>
