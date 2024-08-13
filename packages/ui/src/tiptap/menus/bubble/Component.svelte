<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import type { Editor } from '@tiptap/core';

  export let editor: Editor;
  export let from: number | null = null;
  export let to: number | null = null;

  editor;
</script>

<div class={css({ color: 'white', backgroundColor: 'gray.1000' })}>***버블메뉴*** (from: {from}, to: {to})</div>
