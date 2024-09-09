<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { createFloatingActions } from '@readable/ui/actions';
  import { NodeView } from '@readable/ui/tiptap';
  import { onMount } from 'svelte';
  import EllipsisIcon from '~icons/lucide/ellipsis';
  import FileUpIcon from '~icons/lucide/file-up';
  import Trash2Icon from '~icons/lucide/trash-2';
  import { Button, Icon, Menu, MenuItem, RingSpinner, TextInput } from '../../../components';
  import type { NodeViewProps } from '@readable/ui/tiptap';

  type $$Props = NodeViewProps;
  $$restProps;

  export let node: NodeViewProps['node'];
  export let editor: NodeViewProps['editor'] | undefined;
  export let extension: NodeViewProps['extension'];
  export let selected: NodeViewProps['selected'];
  export let updateAttributes: NodeViewProps['updateAttributes'];
  export let deleteNode: NodeViewProps['deleteNode'];

  let url = '';
  let inflight = false;
  let pickerOpened = false;
  let inputEl: HTMLInputElement;

  $: pickerOpened = selected;

  $: if (pickerOpened && inputEl) {
    inputEl.focus();
  }

  const { anchor, floating } = createFloatingActions({
    placement: 'bottom',
    offset: 4,
    onClickOutside: () => {
      pickerOpened = false;
    },
  });

  const handleInsert = async () => {
    if (!url) {
      return;
    }

    inflight = true;
    try {
      const attrs = await extension.options.handleEmbed(url);
      updateAttributes(attrs);
    } finally {
      inflight = false;
    }
  };

  onMount(() => {
    if (!document.querySelector('script#iframely-embed')) {
      const script = document.createElement('script');
      script.id = 'iframely-embed';
      script.async = true;
      script.src = 'https://cdn.iframe.ly/embed.js';
      document.head.append(script);
    }
  });
</script>

<NodeView data-drag-handle draggable>
  <div
    class={css({
      position: 'relative',
      _hover: { '& > button': { display: 'flex' }, '& > button > div': { display: 'flex' } },
    })}
  >
    {#if node.attrs.id}
      {#if node.attrs.html}
        <div class={css({ display: 'contents' }, editor?.isEditable && { pointerEvents: 'none' })}>
          {@html node.attrs.html}
        </div>
      {:else}
        <div class={flex({ borderWidth: '1px', borderColor: 'border.primary', borderRadius: '6px' })}>
          <div class={flex({ direction: 'column', grow: '1', paddingX: '16px', paddingY: '15px', truncate: true })}>
            <p class={css({ marginBottom: '3px', textStyle: '14m', truncate: true })}>
              {node.attrs.title ?? '(제목 없음)'}
            </p>
            <p class={css({ textStyle: '12m', color: 'text.secondary', lineClamp: 2, whiteSpace: 'pre-wrap' })}>
              {node.attrs.description ?? ''}
            </p>
            <p class={css({ marginTop: 'auto', textStyle: '12m', truncate: true })}>{new URL(node.attrs.url).origin}</p>
          </div>
          {#if node.attrs.thumbnailUrl}
            <img
              class={css({
                borderTopRightRadius: '5px',
                borderBottomRightRadius: '5px',
                size: '118px',
                objectFit: 'cover',
              })}
              alt={node.attrs.title ?? '(제목 없음)'}
              src={node.attrs.thumbnailUrl}
            />
          {/if}
        </div>
      {/if}

      {#if editor?.isEditable}
        <button
          class={css(
            {
              position: 'absolute',
              top: '8px',
              right: '8px',
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px',
              color: 'neutral.50',
              backgroundColor: 'neutral.10',
              size: '24px',
              _hover: { backgroundColor: 'neutral.20' },
            },
            !node.attrs.id && { top: '1/2', translate: 'auto', translateY: '-1/2' },
          )}
          type="button"
          on:click={() => deleteNode()}
        >
          <Icon icon={Trash2Icon} size={12} />
        </button>
      {/if}
    {:else}
      <div
        class={flex({
          align: 'center',
          gap: '7px',
          borderWidth: '1px',
          borderColor: 'border.primary',
          borderRadius: '10px',
          paddingX: '14px',
          paddingY: '12px',
          textStyle: '14r',
          color: 'text.tertiary',
          backgroundColor: 'neutral.20',
          width: 'full',
        })}
        use:anchor
      >
        {#if inflight}
          <RingSpinner style={css.raw({ size: '20px', color: 'neutral.40' })} />
          <p>임베드 중...</p>
        {:else}
          <Icon icon={FileUpIcon} size={20} />
          <p>임베드할 링크를 입력해주세요</p>
        {/if}
      </div>

      <Menu style={css.raw({ position: 'absolute', top: '12px', right: '12px' })}>
        <div
          slot="button"
          class={css(
            {
              display: 'none',
              borderRadius: '4px',
              padding: '2px',
              color: 'text.tertiary',
              _hover: { backgroundColor: 'neutral.40' },
            },
            open && { display: 'flex' },
          )}
          let:open
        >
          <Icon icon={EllipsisIcon} size={20} />
        </div>

        <MenuItem variant="danger" on:click={() => deleteNode()}>
          <Icon icon={Trash2Icon} size={12} />
          <span>삭제</span>
        </MenuItem>
      </Menu>
    {/if}
  </div>
</NodeView>

{#if pickerOpened && !node.attrs.id && !inflight && editor?.isEditable}
  <form
    class={flex({
      direction: 'column',
      align: 'center',
      borderWidth: '1px',
      borderColor: 'border.primary',
      borderRadius: '12px',
      padding: '12px',
      backgroundColor: 'surface.primary',
      width: '340px',
      boxShadow: 'strong',
    })}
    on:submit|preventDefault={handleInsert}
    use:floating
  >
    <p class={css({ marginBottom: '2px', textStyle: '14b' })}>URL을 입력해주세요</p>
    <span class={css({ marginBottom: '12px', textStyle: '13r', color: 'text.tertiary' })}>
      PDF, Google Drive 등의 링크와 호환됩니다
    </span>
    <TextInput style={css.raw({ width: 'full' })} bind:value={url} bind:inputEl />
    <Button style={css.raw({ marginTop: '27px', width: 'full' })} size="lg" type="submit">확인</Button>
  </form>
{/if}
