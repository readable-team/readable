<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { createFloatingActions } from '@readable/ui/actions';
  import { NodeView } from '@readable/ui/tiptap';
  import EllipsisIcon from '~icons/lucide/ellipsis';
  import ImageIcon from '~icons/lucide/image';
  import Trash2Icon from '~icons/lucide/trash-2';
  import { Button, Icon, Img, Menu, MenuItem, RingSpinner } from '../../../components';
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
    picker.accept = 'image/*';

    picker.addEventListener('change', async () => {
      pickerOpened = false;

      const file = picker.files?.[0];
      if (!file) {
        return;
      }

      inflight = true;
      try {
        const attrs = await extension.options.handleImageUpload(file);
        updateAttributes(attrs);
      } finally {
        inflight = false;
      }
    });

    picker.click();
  };
</script>

<NodeView data-drag-handle draggable>
  {#if node.attrs.id}
    <div class={css({ position: 'relative', _hover: { '& > button': { display: 'flex' } } })}>
      <Img
        style={css.raw({ width: 'screen' })}
        alt=""
        placeholder={node.attrs.placeholder}
        progressive
        ratio={node.attrs.ratio}
        size="full"
        url={node.attrs.url}
      />

      {#if editor?.isEditable}
        <button
          class={css({
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
          })}
          type="button"
          on:click={() => deleteNode()}
        >
          <Icon icon={Trash2Icon} size={12} />
        </button>
      {/if}
    </div>
  {:else}
    <div
      class={css(
        {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '7px',
          borderRadius: '10px',
          backgroundColor: 'neutral.20',
          _hover: { '& > button > div': { display: 'flex' } },
        },
        pickerOpened && { backgroundColor: 'neutral.30' },
      )}
      use:anchor
    >
      <div
        class={flex({
          align: 'center',
          gap: '12px',
          paddingX: '14px',
          paddingY: '12px',
          textStyle: '14r',
          color: 'text.tertiary',
        })}
      >
        {#if inflight}
          <RingSpinner style={css.raw({ color: 'neutral.40', size: '20px' })} />
          이미지 업로드 중
        {:else}
          <Icon style={css.raw({ color: 'text.tertiary' })} icon={ImageIcon} size={20} />
          이미지 업로드
        {/if}
      </div>

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
    </div>
  {/if}
</NodeView>

{#if pickerOpened && !node.attrs.id && !inflight && editor?.isEditable}
  <div
    class={flex({
      direction: 'column',
      align: 'center',
      borderWidth: '1px',
      borderColor: 'border.primary',
      borderRadius: '10px',
      padding: '12px',
      backgroundColor: 'surface.primary',
      width: '340px',
      boxShadow: 'strong',
    })}
    use:floating
  >
    <p class={css({ marginBottom: '2px', textStyle: '14b' })}>이미지 업로드</p>
    <span class={css({ textStyle: '13r', color: 'text.tertiary' })}>아래 버튼을 클릭해 파일을 선택하세요</span>
    <Button style={css.raw({ marginTop: '12px', width: 'full' })} size="sm" on:click={handleUpload}>
      파일 선택하기...
    </Button>
  </div>
{/if}
