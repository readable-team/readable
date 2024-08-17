<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { createFloatingActions } from '@readable/ui/actions';
  import { NodeView } from '@readable/ui/tiptap';
  import { onMount } from 'svelte';
  import FolderIcon from '~icons/lucide/folder';
  import { Button, Icon, RingSpinner } from '../../../components';
  import type { NodeViewProps } from '@readable/ui/tiptap';

  type $$Props = NodeViewProps;
  $$restProps;

  export let node: NodeViewProps['node'];
  export let extension: NodeViewProps['extension'];
  export let selected: NodeViewProps['selected'];
  export let updateAttributes: NodeViewProps['updateAttributes'];
  // export let deleteNode: NodeViewProps['deleteNode'];

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
