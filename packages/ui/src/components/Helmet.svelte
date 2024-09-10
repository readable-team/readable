<script lang="ts">
  import { page } from '$app/stores';

  export let type = 'website';
  export let title: string;
  export let trailing: string | null = 'readable';
  export let description: string | undefined = undefined;
  export let image: string | { src: string; size: 'small' | 'large' } | undefined = undefined;
  export let struct: Record<string, unknown> | undefined = undefined;

  $: ({
    url: { href },
  } = $page);

  $: effectiveTitle = trailing ? `${title}${trailing ? ` · ${trailing}` : ''}` : title;
</script>

<svelte:head>
  <title>{effectiveTitle}</title>
  <meta content={effectiveTitle} property="og:title" />
  {#if description}
    <meta name="description" content={description} />
    <meta content={description} property="og:description" />
  {/if}
  {#if typeof image === 'string'}
    <meta content={image} property="og:image" />
    <meta content="summary" property="twitter:card" />
  {:else if typeof image === 'object'}
    <meta content={image.src} property="og:image" />
    {#if image.size === 'large'}
      <meta content="summary_large_image" property="twitter:card" />
    {:else}
      <meta content="summary" property="twitter:card" />
    {/if}
  {/if}
  <link {href} rel="canonical" />
  <meta content={href} property="og:url" />
  <meta content="Readable" property="og:site_name" />
  <meta content={type} property="og:type" />
  <meta content="ko_KR" property="og:locale" />
  {#if struct}
    {@html '<script type="application/ld+json">' + JSON.stringify(struct) + '</script>'}
  {/if}
</svelte:head>
