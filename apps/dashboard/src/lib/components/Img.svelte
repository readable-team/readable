<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { fragment, graphql } from '$graphql';
  import type { SystemStyleObject } from '@readable/styled-system/types';
  import type { Img_image } from '$graphql';

  export let alt: string;
  export let style: SystemStyleObject | undefined = undefined;
  let _image: Img_image;
  export { _image as $image };

  $: image = fragment(
    _image,
    graphql(`
      fragment Img_image on Image {
        id
        url
      }
    `),
  );

  $: src = $image.url;
</script>

<img class={css(style)} {alt} {src} />
