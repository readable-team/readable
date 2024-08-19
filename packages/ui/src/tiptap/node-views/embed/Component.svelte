<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { createFloatingActions } from '@readable/ui/actions';
  import { NodeView } from '@readable/ui/tiptap';
  import { onMount } from 'svelte';
  import ExternalLinkIcon from '~icons/lucide/external-link';
  import Trash2Icon from '~icons/lucide/trash-2';
  import { Button, Icon, RingSpinner, TextInput } from '../../../components';
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

<NodeView>
  <div class={css({ position: 'relative', _hover: { '& > button': { display: 'flex' } } })}>
    {#if node.attrs.id}
      {#if node.attrs.html}
        <div class={css({ display: 'contents', pointerEvents: 'none' })}>
          {@html node.attrs.html}
        </div>
      {:else}
        <div class={flex({ borderWidth: '1px', borderColor: 'border.tertiary', borderRadius: '6px' })}>
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
    {:else}
      <div
        class={flex({
          align: 'center',
          gap: '7px',
          borderRadius: '10px',
          padding: '17px',
          textStyle: '16m',
          color: 'text.secondary',
          backgroundColor: {
            base: 'neutral.10',
            _hover: 'neutral.20',
          },
          width: 'full',
        })}
        use:anchor
      >
        {#if inflight}
          <RingSpinner style={css.raw({ size: '28px', color: 'neutral.60' })} />
          <p>임베드 중...</p>
        {:else}
          <Icon icon={ExternalLinkIcon} size={16} />
          <p>무엇이든 임베드해보세요</p>
        {/if}
      </div>
    {/if}

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
  </div>
</NodeView>

{#if pickerOpened && !node.attrs.id && !inflight}
  <form
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
    on:submit|preventDefault={handleInsert}
    use:floating
  >
    <TextInput style={css.raw({ width: 'full' })} bind:value={url} />
    <Button style={css.raw({ width: 'full' })} size="lg" type="submit">링크 임베드</Button>
    <span class={css({ textStyle: '13m', color: 'text.tertiary' })}>PDF, Google Drive 등의 링크와 호환됩니다</span>
  </form>
{/if}
