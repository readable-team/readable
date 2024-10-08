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
  export let handleLink: (url: string) => Promise<Record<string, unknown>>;

  let linkDraft = '';
  let floatingElement: HTMLElement;
  let inputElement: HTMLInputElement;
  let cleanup: (() => void) | null = null;

  const addHttpScheme = (url: string) => {
    if (!url.includes('://')) {
      return `http://${url}`;
    }
    return url;
  };

  const loadLink = async (href: string) => {
    if (currentLink) {
      const resp = await handleLink(href);
      linkDraft = resp.url ? `${resp.host}${resp.url}` : href;
    } else {
      linkDraft = href;
    }
  };

  $: loadLink(defaultLink);

  const updateLink = async () => {
    linkDraft = linkDraft.trim();
    linkDraft = addHttpScheme(linkDraft);

    const attrs = await handleLink(linkDraft);

    const { tr } = editor.view.state;
    tr.addMark(from, to, editor.schema.marks.link.create({ ...attrs }));
    editor.view.dispatch(tr);

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
        placement: 'bottom-start',
        middleware: [offset(4)],
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
      width: '300px',
      backgroundColor: 'background.overlay',
      borderRadius: '10px',
      boxShadow: 'strong',
      gap: '4px',
      padding: '4px',
    })}
    on:submit|preventDefault={updateLink}
  >
    <!-- FIXME: 유효한 링크인지 검사? -->
    <TextInput
      name="link-draft"
      style={css.raw({
        flex: '1',
      })}
      placeholder="https://..."
      size="sm"
      bind:inputEl={inputElement}
      bind:value={linkDraft}
    />
    <Button disabled={linkDraft === ''} size="sm" type="submit" variant="primary">
      {#if !currentLink}
        확인
      {:else}
        수정
      {/if}
    </Button>
  </form>
</div>
