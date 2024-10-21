<svelte:options customElement={{ tag: 'rdbl-widget' }} />

<script lang="ts">
  import { onMount } from 'svelte';
  import Widget from './Widget.svelte';

  let loaded = false;

  const scriptUrl = (document.currentScript as HTMLScriptElement).src;
  const styleUrl = new URL('style.css', scriptUrl);

  onMount(() => {
    loaded = true;
  });
</script>

{@html `<style>@import url(${styleUrl.href});</style>`}

{#if loaded}
  <Widget />
{/if}
