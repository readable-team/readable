<script lang="ts">
  import { css, cx } from '@readable/styled-system/css';
  import { Editor } from '@tiptap/core';
  import { createEventDispatcher, onMount } from 'svelte';
  import { TableOfContents } from '../extensions/table-of-contents';
  import { renderHTML } from '../lib/html';
  import { Embed } from '../node-views/embed';
  import { File } from '../node-views/file';
  import { Image } from '../node-views/image';
  import { InlineImage } from '../node-views/inline-image';
  import { basicExtensions } from '../schema';
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

  $: html = renderHTML(content, [...basicExtensions, Embed, Image, InlineImage, File]);
  $: editor?.commands.setContent(content);

  onMount(() => {
    editor = new Editor({
      element,
      editable: false,
      content,
      extensions: [
        ...basicExtensions,
        Embed,
        Image,
        InlineImage,
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
