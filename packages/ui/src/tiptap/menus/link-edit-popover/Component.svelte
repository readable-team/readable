<script lang="ts">
  import { autoUpdate, computePosition, offset } from '@floating-ui/dom';
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { onDestroy, onMount } from 'svelte';
  import { Button, TextInput } from '../../../components';
  import type { VirtualElement } from '@floating-ui/dom';
  import type { Editor } from '@tiptap/core';

  export let editor: Editor;
  export let from: number;
  export let to: number;
  export let referenceElement: Element | VirtualElement;
  export let currentLink: string | null;
  export let defaultLink = '';
  export let onClose: () => void;

  let linkDraft = defaultLink;
  let floatingElement: HTMLElement;
  let inputElement: HTMLInputElement;
  let cleanup: (() => void) | null = null;

  const addHttpScheme = (url: string) => {
    if (!url.includes('://')) {
      return `http://${url}`;
    }
    return url;
  };

  const updateLink = () => {
    linkDraft = linkDraft.trim();
    linkDraft = addHttpScheme(linkDraft);

    const { state, dispatch } = editor.view;
    let { tr } = state;

    tr.addMark(from, to, editor.schema.marks.link.create({ href: linkDraft }));

    dispatch(tr);
    onClose();
  };

  const clickListener = (event: Event) => {
    if (!floatingElement?.contains(event.target as Node)) {
      onClose();
    }
  };

  onMount(() => {
    cleanup = autoUpdate(referenceElement, floatingElement, async () => {
      const { x, y } = await computePosition(referenceElement, floatingElement, {
        placement: 'bottom',
        middleware: [offset(12)],
      });

      floatingElement.style.left = `${x}px`;
      floatingElement.style.top = `${y}px`;
    });

    setTimeout(() => {
      inputElement.focus();
    });

    setTimeout(() => {
      document.addEventListener('click', clickListener);
    });
  });

  onDestroy(() => {
    cleanup?.();
    document.removeEventListener('click', clickListener);
  });
</script>

<svelte:window on:keydown={(e) => e.key === 'Escape' && onClose()} />

<div
  bind:this={floatingElement}
  class={css({
    position: 'absolute',
    top: '0',
    left: '0',
  })}
>
  <form
    class={flex({
      width: '460px',
      flexDirection: 'column',
      backgroundColor: 'background.overlay',
      borderRadius: '10px',
      boxShadow: 'heavy',
      gap: '14px',
      padding: '20px',
    })}
    on:submit|preventDefault={updateLink}
  >
    <!-- FIXME: 유효한 링크인지 검사? -->
    <TextInput name="link-draft" placeholder="https://..." bind:inputEl={inputElement} bind:value={linkDraft} />
    <Button disabled={linkDraft === ''} size="lg" type="submit" variant="primary">
      {#if !currentLink}
        확인
      {:else}
        수정
      {/if}
    </Button>
  </form>
</div>
