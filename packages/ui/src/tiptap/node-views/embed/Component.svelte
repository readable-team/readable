<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { createFloatingActions } from '@readable/ui/actions';
  import { NodeView } from '@readable/ui/tiptap';
  import FolderIcon from '~icons/lucide/folder';
  import Trash2Icon from '~icons/lucide/trash-2';
  import { Button, Icon, RingSpinner } from '../../../components';
  import type { NodeViewProps } from '@readable/ui/tiptap';

  type $$Props = NodeViewProps;
  $$restProps;

  export let node: NodeViewProps['node'];
  export let extension: NodeViewProps['extension'];
  export let selected: NodeViewProps['selected'];
  export let updateAttributes: NodeViewProps['updateAttributes'];
  export let deleteNode: NodeViewProps['deleteNode'];

  let url = '';
  let inflight = false;
  let pickerOpened = false;
  $: pickerOpened = selected;

  const { anchor, floating } = createFloatingActions({
    placement: 'bottom-start',
    offset: 12,
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
</script>

<NodeView
  style={css.raw(
    {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: '10px',
      backgroundColor: {
        base: 'neutral.10',
        _hover: 'neutral.20',
      },
      _hover: { '& > button': { display: 'flex' } },
    },
    pickerOpened && { backgroundColor: 'neutral.30' },
  )}
>
  {#if node.attrs.id}
    {#if node.attrs.html}
      <div class={css({ display: 'contents', pointerEvents: 'none' })}>
        {@html node.attrs.html}
      </div>
    {:else}
      <div
        class={flex({
          direction: 'column',
          gap: '8px',
          paddingX: '10px',
          paddingY: '12px',
          textStyle: '16m',
        })}
      >
        <span>{node.attrs.title ?? '(제목 없음)'}</span>
        <span>{node.attrs.description ?? ''}</span>
        <span>{new URL(node.attrs.url).origin}</span>
        {#if node.attrs.thumbnailUrl}
          <img alt={node.attrs.title ?? '(제목 없음)'} src={node.attrs.thumbnailUrl} />
        {/if}
      </div>
    {/if}
  {:else}
    <div
      class={flex({
        align: 'center',
        gap: '7px',
        padding: '17px',
        textStyle: '16m',
        color: 'text.secondary',
        width: 'full',
      })}
      use:anchor
    >
      {#if inflight}
        <RingSpinner style={css.raw({ size: '28px', color: 'neutral.60' })} />
        가져오는 중...
      {:else}
        <Icon icon={FolderIcon} size={16} />
        링크 임베드
      {/if}
    </div>
  {/if}

  <button
    class={css({
      display: 'none',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: node.attrs.id ? '10px' : '17px',
      borderRadius: '4px',
      color: 'neutral.50',
      size: '24px',
      _hover: { backgroundColor: 'neutral.30' },
    })}
    type="button"
    on:click={() => deleteNode()}
  >
    <Icon icon={Trash2Icon} size={12} />
  </button>
</NodeView>

{#if pickerOpened && !node.attrs.id && !inflight}
  <div
    class={flex({
      direction: 'column',
      align: 'center',
      gap: '14px',
      borderRadius: '10px',
      padding: '20px',
      backgroundColor: 'surface.primary',
      width: '460px',
      boxShadow: 'heavy',
    })}
    use:floating
  >
    <input class={css({ borderWidth: '1px' })} type="text" bind:value={url} />
    <Button style={css.raw({ width: 'full' })} size="lg" on:click={handleInsert}>삽입</Button>
    <span class={css({ textStyle: '13m', color: 'text.tertiary' })}>파일당 최대 크기는 5MB입니다</span>
  </div>
{/if}
