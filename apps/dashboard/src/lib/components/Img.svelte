<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { toUint8Array } from 'js-base64';
  import qs from 'query-string';
  import { onMount, tick } from 'svelte';
  import { fade } from 'svelte/transition';
  import { thumbHashToDataURL } from 'thumbhash';
  import { fragment, graphql } from '$graphql';
  import type { SystemStyleObject } from '@readable/styled-system/types';
  import type { Img_image } from '$graphql';

  type Size = 16 | 24 | 32 | 48 | 64 | 96 | 128 | 256 | 512 | 1024 | 'full';

  let _image: Img_image;
  export { _image as $image };
  export let alt: string;
  export let style: SystemStyleObject | undefined = undefined;
  export let size: Size;
  export let quality: number | undefined = undefined;
  export let progressive = false;

  $: image = fragment(
    _image,
    graphql(`
      fragment Img_image on Image {
        id
        url
        placeholder
      }
    `),
  );

  let containerEl: HTMLDivElement | undefined;
  let contentEl: HTMLDivElement | undefined;
  let loaded = false;

  $: src = $image && qs.stringifyUrl({ url: $image.url, query: { s: size === 'full' ? undefined : size, q: quality } });
  $: src2x = $image && size !== 'full' && qs.stringifyUrl({ url: $image.url, query: { s: size * 2, q: quality } });
  $: src3x = $image && size !== 'full' && qs.stringifyUrl({ url: $image.url, query: { s: size * 3, q: quality } });

  $: sizes = size === 'full' ? undefined : `${size}px`;
  $: srcset = size === 'full' ? undefined : `${src} ${size}w, ${src2x} ${size * 2}w, ${src3x} ${size * 3}w`;

  $: placeholderUrl = progressive ? thumbHashToDataURL(toUint8Array($image.placeholder)) : undefined;

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
        if (entries[0].isIntersecting) {
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
  <div bind:this={containerEl} class={css({ position: 'relative' })}>
    <img class={css(style)} {alt} loading="lazy" src={placeholderUrl} />
    {#if loaded}
      <div bind:this={contentEl} class={css({ position: 'absolute', inset: '0' })} in:fade={{ duration: 200 }} />
    {/if}
  </div>
{:else}
  <img class={css(style)} {alt} loading="lazy" {sizes} {src} {srcset} />
{/if}
