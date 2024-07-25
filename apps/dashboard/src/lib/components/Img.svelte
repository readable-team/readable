<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { PUBLIC_USERCONTENTS_URL } from '$env/static/public';
  import type { SystemStyleObject } from '@readable/styled-system/types';

  export let url: string;
  export let alt: string;
  export let style: SystemStyleObject | undefined = undefined;

  $: src = `${PUBLIC_USERCONTENTS_URL}/${url}`;
</script>

<img class={css(style)} {alt} {src} />
