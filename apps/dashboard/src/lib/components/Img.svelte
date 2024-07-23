<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { PUBLIC_USERCONTENTS_URL } from '$env/static/public';
  import { trpc } from '$lib/trpc';
  import type { SystemStyleObject } from '@readable/styled-system/types';

  export let id: string;
  export let alt: string;
  export let style: SystemStyleObject | undefined = undefined;
</script>

{#await trpc.image.get.query({ id })}
  <div class={css(style, { backgroundColor: 'gray.200' })} />
{:then image}
  {@const src = `${PUBLIC_USERCONTENTS_URL}/images/${image.path}`}
  <img class={css(style)} {alt} {src} />
{/await}
