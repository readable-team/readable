<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { center } from '@readable/styled-system/patterns';
  import qs from 'query-string';
  import { base64 } from 'rfc4648';
  import { onMount, tick } from 'svelte';
  import { fade } from 'svelte/transition';
  import { thumbHashToDataURL } from 'thumbhash';
  import RingSpinner from './RingSpinner.svelte';
  import type { SystemStyleObject } from '@readable/styled-system/types';

  type Size = 16 | 24 | 32 | 48 | 64 | 96 | 128 | 256 | 512 | 1024 | 'full';

  export let url: string;
  export let placeholder: string | undefined = undefined;
  export let ratio: number | undefined = undefined;

  export let alt: string;
  export let style: SystemStyleObject | undefined = undefined;
  export let size: Size;
  export let quality: number | undefined = undefined;
  export let progressive = false;

  let containerEl: HTMLDivElement | undefined;
  let contentEl: HTMLDivElement | undefined;
  let loaded = false;

  $: src = qs.stringifyUrl({ url, query: { s: size === 'full' ? undefined : size, q: quality } });
  $: src2x = size !== 'full' && qs.stringifyUrl({ url, query: { s: size * 2, q: quality } });
  $: src3x = size !== 'full' && qs.stringifyUrl({ url, query: { s: size * 3, q: quality } });

  $: sizes = size === 'full' ? undefined : `${size}px`;
  $: srcset = size === 'full' ? undefined : `${src} ${size}w, ${src2x} ${size * 2}w, ${src3x} ${size * 3}w`;

  $: placeholderUrl = progressive && placeholder ? thumbHashToDataURL(base64.parse(placeholder)) : undefined;

  const load = async () => {
    const imgEl = new Image();

    const onload = async () => {
      if (loaded) {
        return;
      }

      loaded = true;
      await tick();

      contentEl?.prepend(imgEl);
    };

    imgEl.addEventListener('load', onload);

    imgEl.className = css(style);
    if (sizes) imgEl.sizes = sizes;
    if (srcset) imgEl.srcset = srcset;
    imgEl.src = src;

    await tick();

    if (imgEl.complete) {
      onload();
    }
  };

  onMount(() => {
    if (containerEl) {
      const observer = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          load();
        }
      });

      observer.observe(containerEl);

      return () => observer.disconnect();
    }
  });
</script>

{#if placeholderUrl}
  <div
    bind:this={containerEl}
    class={css({
      position: 'relative',
      width: 'fit',
      overflow: 'hidden',
    })}
  >
    <img style:aspect-ratio={ratio} class={css(style)} {alt} loading="lazy" src={placeholderUrl} />

    {#if loaded}
      <div bind:this={contentEl} class={css({ position: 'absolute', inset: '0' })} in:fade={{ duration: 200 }} />
    {:else}
      <div class={center({ position: 'absolute', inset: '0' })}>
        <RingSpinner style={css.raw({ size: '20px' })} />
      </div>
    {/if}
  </div>
{:else}
  <img class={css(style)} {alt} loading="lazy" {sizes} {src} {srcset} />
{/if}
