<script lang="ts">
  import { Img } from '@readable/ui/components';
  import { fragment, graphql } from '$graphql';
  import type { SystemStyleObject } from '@readable/styled-system/types';
  import type { ComponentProps } from 'svelte';
  import type { Img_image } from '$graphql';

  type Size = ComponentProps<Img>['size'];

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
        ratio
        placeholder
      }
    `),
  );
</script>

<Img
  {style}
  {alt}
  placeholder={$image.placeholder}
  {progressive}
  {quality}
  ratio={$image.ratio}
  {size}
  url={$image.url}
/>
