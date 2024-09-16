<script lang="ts">
  import { browser } from '$app/environment';
  import { graphql } from '$graphql';
  import Img from './Img.svelte';
  import type { SystemStyleObject } from '@readable/styled-system/types';
  import type { ComponentProps } from 'svelte';

  type Size = ComponentProps<Img>['size'];

  export let id: string;
  export let alt: string;
  export let style: SystemStyleObject | undefined = undefined;
  export let size: Size;
  export let quality: number | undefined = undefined;
  export let progressive = false;

  $: query = graphql(`
    query LoadableImg_Query($id: ID!) @manual {
      image(id: $id) {
        id
        ...Img_image
      }
    }
  `);

  $: if (browser) {
    query.refetch({ id });
  }
</script>

{#if $query}
  <Img {style} $image={$query.image} {alt} {progressive} {quality} {size} />
{/if}
