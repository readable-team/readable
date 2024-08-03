<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { env } from '$env/dynamic/public';
  import type { SystemStyleObject } from '@readable/styled-system/types';

  export let url: string;
  export let alt: string;
  export let style: SystemStyleObject | undefined = undefined;

  $: src = `${env.PUBLIC_USERCONTENTS_URL}/${url}`;
</script>

<img class={css(style)} {alt} {src} />
