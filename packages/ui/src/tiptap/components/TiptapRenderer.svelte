<script lang="ts">
  import { css, cx } from '@readable/styled-system/css';
  import { Editor } from '@tiptap/core';
  import { generateHTML } from '@tiptap/html';
  import { createEventDispatcher, onMount } from 'svelte';
  import { TableOfContents } from '../extensions/table-of-contents';
  import { Embed } from '../node-views/embed';
  import { File } from '../node-views/file';
  import { Image } from '../node-views/image';
  import { extensions } from '../schema';
  import type { SystemStyleObject } from '@readable/styled-system/types';
  import type { JSONContent } from '@tiptap/core';

  export let style: SystemStyleObject | undefined = undefined;
  export let content: JSONContent;
  export let editor: Editor | undefined = undefined;

  let element: HTMLElement;
  let loaded = false;

  const dispatch = createEventDispatcher<{
    tocUpdate: { headings: { level: number; text: string; scrollTop: number }[] };
  }>();

  $: html = generateHTML(content, [...extensions, Embed, Image, File]);
  $: editor?.commands.setContent(content);

  onMount(() => {
    editor = new Editor({
      element,
      editable: false,
      content,
      extensions: [
        ...extensions,
        Embed,
        Image,
        File,
        TableOfContents.configure({
          onUpdate: (headings) => {
            dispatch('tocUpdate', { headings });
          },
        }),
      ],
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
  class={css({
    display: 'contents',
    fontFamily: 'prose',
    whiteSpace: 'pre-wrap',
    overflowWrap: 'break-word',
  })}
>
  {#if !loaded}
    <div class={cx('ProseMirror', css(style))}>
      {@html html}
    </div>
  {/if}
</article>
