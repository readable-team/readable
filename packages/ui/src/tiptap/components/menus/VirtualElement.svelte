<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Editor } from '@tiptap/core';
  import { onMount } from 'svelte';
  import { sineIn } from 'svelte/easing';
  import { fade } from 'svelte/transition';
  import { portal } from '../../../actions';

  export let editor: Editor;
  export let pos: number;

  let nodeId: string;

  let top: number;
  let left: number;
  let width: number;
  let height: number;

  const update = () => {
    const n = editor.state.doc.nodeAt(pos);
    if (!n) {
      return;
    }

    nodeId = n.attrs.nodeId;

    const { node, offset } = editor.view.domAtPos(pos);
    if (!(node instanceof Element)) {
      return;
    }

    const element = node.children[offset];
    if (!element) {
      return;
    }

    const rect = element.getBoundingClientRect();

    top = rect.top;
    left = rect.left;
    width = rect.width;
    height = rect.height;
  };

  $: {
    pos;
    update();
  }

  onMount(() => {
    update();

    editor.on('transaction', update);

    return () => {
      editor.off('transaction', update);
    };
  });
</script>

<svelte:window on:resize={update} on:scroll|capture={update} />

{#key nodeId}
  <div
    style:top={`${top}px`}
    style:left={`${left}px`}
    style:width={`${width}px`}
    style:height={`${height}px`}
    class={flex({ gap: '8px', position: 'absolute', pointerEvents: 'none', zIndex: '50' })}
    use:portal
    transition:fade|global={{ duration: 150, easing: sineIn }}
  >
    <div class={flex({ flex: '1', justify: 'flex-end', align: 'center', height: '[1lh]', pointerEvents: 'auto' })}>
      <slot name="left" />
    </div>
    <div class={css({ width: '720px' })} />
    <div class={flex({ flex: '1', justify: 'flex-start', align: 'center', height: '[1lh]', pointerEvents: 'auto' })}>
      <slot name="right" />
    </div>
  </div>
{/key}
