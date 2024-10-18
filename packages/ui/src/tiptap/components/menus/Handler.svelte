<script lang="ts">
  import { Editor } from '@tiptap/core';
  import Floating from './Floating.svelte';
  import VirtualElement from './VirtualElement.svelte';

  export let editor: Editor;

  let pos: number | null = null;

  const handlePointerMove = (event: PointerEvent) => {
    const { clientX, clientY } = event;
    const posAtCoords = editor.view.posAtCoords({ left: clientX, top: clientY });

    if (posAtCoords) {
      if (posAtCoords.inside === -1) {
        pos = null;
      } else {
        const pos$ = editor.state.doc.resolve(posAtCoords.inside);
        pos = pos$.before(1);
      }
    } else {
      pos = null;
    }
  };
</script>

<svelte:window on:pointermove={handlePointerMove} />

{#if pos !== null}
  <VirtualElement {editor} {pos}>
    <Floating slot="left" {editor} {pos} />
  </VirtualElement>
{/if}
