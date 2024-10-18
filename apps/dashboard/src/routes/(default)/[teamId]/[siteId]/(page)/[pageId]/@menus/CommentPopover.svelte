<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { center, flex } from '@readable/styled-system/patterns';
  import { createFloatingActions } from '@readable/ui/actions';
  import { Icon } from '@readable/ui/components';
  import { createEventDispatcher, onMount } from 'svelte';
  import ArrowUpIcon from '~icons/lucide/arrow-up';
  import { fragment, graphql } from '$graphql';
  import type { Editor } from '@tiptap/core';
  import type { Editor_CommentPopover_pageContentComment } from '$graphql';

  export let anchor: HTMLElement;
  export let editor: Editor;
  export let pos: number;
  export let pageId: string;

  let _comments: Editor_CommentPopover_pageContentComment[];
  export { _comments as $comments };

  $: comments = fragment(
    _comments,
    graphql(`
      fragment Editor_CommentPopover_pageContentComment on PageContentComment {
        id
        nodeId
        content
      }
    `),
  );

  const addPageContentComment = graphql(`
    mutation PagePage_AddPageContentComment_Mutation($input: AddPageContentCommentInput!) {
      addPageContentComment(input: $input) {
        id
      }
    }
  `);

  const dispatch = createEventDispatcher<{ close: undefined }>();
  const { floating, anchor: reference } = createFloatingActions({
    placement: 'bottom-start',
    offset: 8,
  });

  let popoverEl: HTMLDivElement;
  let content = '';

  const onClickOutside = (e: MouseEvent) => {
    if (!popoverEl.contains(e.target as Node)) {
      dispatch('close');
    }
  };

  const onSubmit = async () => {
    const isFirstComment = $comments.length === 0;

    const node = editor.state.doc.nodeAt(pos);
    if (!node || !node.attrs.nodeId) {
      return;
    }

    await addPageContentComment({
      pageId,
      nodeId: node.attrs.nodeId,
      content,
    });

    content = '';

    if (isFirstComment) {
      dispatch('close');
    }
  };

  onMount(() => {
    reference(anchor);
  });
</script>

<svelte:window on:click|capture={onClickOutside} />

<div
  bind:this={popoverEl}
  class={flex({
    flexDirection: 'column',
    gap: '8px',
    borderRadius: '4px',
    paddingX: '16px',
    paddingY: '8px',
    backgroundColor: 'white',
    boxShadow: 'heavy',
    zIndex: '50',
  })}
  use:floating
>
  {#each $comments as comment (comment.id)}
    <div>
      {comment.content}
    </div>
  {/each}

  <div class={flex({ gap: '8px' })}>
    <input
      class={css({
        borderWidth: '1px',
        borderRadius: '4px',
        paddingX: '8px',
        paddingY: '4px',
        backgroundColor: 'neutral.20',
      })}
      type="text"
      bind:value={content}
    />
    <button
      class={center({ borderRadius: 'full', size: '32px', color: 'white', backgroundColor: 'accent.50' })}
      type="button"
      on:click={onSubmit}
    >
      <Icon icon={ArrowUpIcon} size={16} />
    </button>
  </div>
</div>
