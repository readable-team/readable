<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { createFloatingActions } from '@readable/ui/actions';
  import { NodeView } from '@readable/ui/tiptap';
  import FileUpIcon from '~icons/lucide/file-up';
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

  const handleUpload = async () => {
    const picker = document.createElement('input');
    picker.type = 'file';

    picker.addEventListener('change', async () => {
      pickerOpened = false;

      const file = picker.files?.[0];
      if (!file) {
        return;
      }

      inflight = true;
      try {
        const attrs = await extension.options.handleFileUpload(file);
        updateAttributes(attrs);
      } finally {
        inflight = false;
      }
    });

    picker.click();
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
    <div
      class={flex({
        align: 'center',
        gap: '8px',
        paddingX: '10px',
        paddingY: '12px',
        textStyle: '16m',
      })}
    >
      <Icon icon={FileUpIcon} size={24} />
      <span>{node.attrs.name}</span>
    </div>
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
        파일 업로드 중...
      {:else}
        <Icon icon={FolderIcon} size={16} />
        파일 업로드
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
    <Button style={css.raw({ width: 'full' })} size="lg" on:click={handleUpload}>파일 업로드</Button>
    <span class={css({ textStyle: '13m', color: 'text.tertiary' })}>파일당 최대 크기는 5MB입니다</span>
  </div>
{/if}
