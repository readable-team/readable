<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { createFloatingActions } from '@readable/ui/actions';
  import { NodeView } from '@readable/ui/tiptap';
  import ImageIcon from '~icons/lucide/image';
  import Trash2Icon from '~icons/lucide/trash-2';
  import { Button, Icon, Img, RingSpinner } from '../../../components';
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

<NodeView>
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
          padding: '17px',
          backgroundColor: { base: 'neutral.10', _hover: 'neutral.20' },
        },
        pickerOpened && { backgroundColor: 'neutral.30' },
      )}
      use:anchor
    >
      <div class={flex({ align: 'center', gap: '7px' })}>
        {#if inflight}
          <RingSpinner style={css.raw({ color: 'neutral.60', size: '28px' })} />
        {:else}
          <Icon style={css.raw({ color: 'neutral.60' })} icon={ImageIcon} size={18} />
        {/if}
        <span class={css({ textStyle: '16m', color: 'text.secondary' })}>이미지 업로드</span>
      </div>

      <button
        class={flex({
          align: 'center',
          justify: 'center',
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
    <Button style={css.raw({ width: 'full' })} size="lg" on:click={handleUpload}>이미지 업로드</Button>
    <span class={css({ textStyle: '13m', color: 'text.tertiary' })}>파일당 최대 크기는 5MB입니다</span>
  </div>
{/if}
