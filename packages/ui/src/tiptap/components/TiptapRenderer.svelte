<script lang="ts">
  import { css, cx } from '@readable/styled-system/css';
  import { Editor } from '@tiptap/core';
  import { generateHTML } from '@tiptap/html';
  import { onMount } from 'svelte';
  import { extensions } from '../preset';
  import type { SystemStyleObject } from '@readable/styled-system/types';
  import type { JSONContent } from '@tiptap/core';

  export let style: SystemStyleObject | undefined = undefined;
  export let content: JSONContent;
  export let editor: Editor | undefined = undefined;

  let element: HTMLElement;
  let loaded = false;

  $: html = generateHTML(content, extensions);
  $: editor?.commands.setContent(content);

  onMount(() => {
    editor = new Editor({
      element,
      editable: false,
      content,
      extensions,
      injectCSS: false,

      editorProps: {
        attributes: { class: css(style) },
      },

      onBeforeCreate: () => {
        loaded = true;
      },
    });

    return () => {
      editor?.destroy();
      editor = undefined;
    };
  });
</script>

<article
  bind:this={element}
  class={cx(
    'tiptap',
    css({
      display: 'contents',
      fontFamily: 'prose',
      whiteSpace: 'pre-wrap',
      overflowWrap: 'break-word',
    }),
  )}
>
  {#if !loaded}
    <div class={cx('ProseMirror', css(style))}>
      {@html html}
    </div>
  {/if}
</article>
