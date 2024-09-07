<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { createFloatingActions } from '@readable/ui/actions';
  import { NodeView } from '@readable/ui/tiptap';
  import EllipsisIcon from '~icons/lucide/ellipsis';
  import PaperclipIcon from '~icons/lucide/paperclip';
  import Trash2Icon from '~icons/lucide/trash-2';
  import { Button, Icon, Menu, MenuItem, RingSpinner, VerticalDivider } from '../../../components';
  import type { NodeViewProps } from '@readable/ui/tiptap';

  type $$Props = NodeViewProps;
  $$restProps;

  export let node: NodeViewProps['node'];
  export let editor: NodeViewProps['editor'] | undefined;
  export let extension: NodeViewProps['extension'];
  export let selected: NodeViewProps['selected'];
  export let updateAttributes: NodeViewProps['updateAttributes'];
  export let deleteNode: NodeViewProps['deleteNode'];

  let inflight = false;
  let pickerOpened = false;
  $: pickerOpened = selected;

  const { anchor, floating } = createFloatingActions({
    placement: 'bottom',
    offset: 4,
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

  const formatFileSize = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let index = 0;

    while (bytes >= 1024 && index < units.length - 1) {
      bytes /= 1024;
      index++;
    }

    return `${Math.floor(bytes)}${units[index]}`;
  };
</script>

<NodeView
  style={css.raw(
    {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: '1px',
      borderColor: 'border.primary',
      borderRadius: '10px',
      backgroundColor: { base: 'neutral.20' },
      _hover: { '& > button > div': { display: 'flex' } },
    },
    pickerOpened && { backgroundColor: 'neutral.30' },
  )}
>
  {#if node.attrs.id}
    <a
      class={css(
        {
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          paddingX: '14px',
          paddingY: '12px',
          textStyle: '14r',
          truncate: true,
        },
        editor?.isEditable && { pointerEvents: 'none' },
      )}
      href={node.attrs.url}
    >
      <Icon style={css.raw({ color: 'text.tertiary' })} icon={PaperclipIcon} size={20} />
      <span class={css({ truncate: true })}>{node.attrs.name}</span>
      <VerticalDivider style={css.raw({ height: '14px' })} color="secondary" />
      <span class={css({ color: 'text.tertiary' })}>{formatFileSize(node.attrs.size)}</span>
    </a>
  {:else}
    <div
      class={flex({
        align: 'center',
        gap: '12px',
        paddingX: '14px',
        paddingY: '12px',
        textStyle: '14r',
        color: 'text.tertiary',
        width: 'full',
      })}
      use:anchor
    >
      {#if inflight}
        <RingSpinner style={css.raw({ size: '20px', color: 'neutral.40' })} />
        파일 업로드 중...
      {:else}
        <Icon style={css.raw({ color: 'text.tertiary' })} icon={PaperclipIcon} size={20} />
        파일을 업로드 해주세요
      {/if}
    </div>
  {/if}

  {#if editor?.isEditable}
    <Menu>
      <div
        slot="button"
        class={css(
          {
            display: 'none',
            marginRight: '12px',
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
</NodeView>

{#if pickerOpened && !node.attrs.id && !inflight && editor?.isEditable}
  <div
    class={flex({
      direction: 'column',
      align: 'center',
      justify: 'center',
      borderWidth: '1px',
      borderColor: 'border.primary',
      borderRadius: '12px',
      padding: '12px',
      backgroundColor: 'surface.primary',
      width: '340px',
      boxShadow: 'strong',
    })}
    use:floating
  >
    <p class={css({ marginBottom: '2px', textStyle: '14b' })}>파일 업로드</p>
    <span class={css({ textStyle: '13r', color: 'text.tertiary' })}>
      파일을 드래그하거나 버튼을 클릭하여 업로드하세요
    </span>
    <Button style={css.raw({ marginTop: '12px', width: 'full' })} size="sm" on:click={handleUpload}>업로드</Button>
  </div>
{/if}
