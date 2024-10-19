<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { center, flex } from '@readable/styled-system/patterns';
  import { createFloatingActions } from '@readable/ui/actions';
  import { Icon } from '@readable/ui/components';
  import dayjs from 'dayjs';
  import { createEventDispatcher, onMount } from 'svelte';
  import ArrowUpIcon from '~icons/lucide/arrow-up';
  import { fragment, graphql } from '$graphql';
  import { Img } from '$lib/components';
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
        content
        createdAt

        user {
          id
          name

          avatar {
            id
            ...Img_image
          }
        }
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
    gap: '12px',
    borderRadius: '4px',
    paddingX: '16px',
    paddingY: '12px',
    width: '320px',
    maxHeight: '320px',
    backgroundColor: 'white',
    boxShadow: 'heavy',
    zIndex: '50',
  })}
  use:floating
>
  <div class={flex({ flexGrow: '1', flexDirection: 'column', gap: '12px', overflowY: 'auto' })}>
    {#each $comments as comment (comment.id)}
      <div class={flex({ align: 'flex-start', gap: '8px' })}>
        <Img
          style={css.raw({ flex: 'none', borderRadius: 'full', size: '32px' })}
          $image={comment.user.avatar}
          alt={comment.user.name}
          size={32}
        />
        <div class={flex({ flexGrow: '1', flexDirection: 'column' })}>
          <div class={flex({ align: 'center', gap: '4px' })}>
            <div class={css({ flexGrow: '1', textStyle: '13b' })}>{comment.user.name}</div>
            <div class={css({ textStyle: '12r', color: 'neutral.50' })}>{dayjs(comment.createdAt).fromNow()}</div>
          </div>
          <div class={css({ textStyle: '14r' })}>{comment.content}</div>
        </div>
      </div>
    {/each}
  </div>

  <div class={flex({ gap: '8px' })}>
    <input
      class={css({
        flexGrow: '1',
        borderWidth: '1px',
        borderRadius: '4px',
        paddingX: '8px',
        paddingY: '4px',
        textStyle: '14r',
        backgroundColor: 'neutral.20',
      })}
      type="text"
      bind:value={content}
    />
    <button
      class={center({ flex: 'none', borderRadius: 'full', size: '32px', color: 'white', backgroundColor: 'accent.50' })}
      type="button"
      on:click={onSubmit}
    >
      <Icon icon={ArrowUpIcon} size={16} />
    </button>
  </div>
</div>
