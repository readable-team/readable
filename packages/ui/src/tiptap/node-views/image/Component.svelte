<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { createFloatingActions } from '@readable/ui/actions';
  import { NodeView } from '@readable/ui/tiptap';
  import Button from '../../../components/Button.svelte';
  import Img from '../../../components/Img.svelte';
  import type { NodeViewProps } from '@readable/ui/tiptap';

  type $$Props = NodeViewProps;
  $$restProps;

  export let node: NodeViewProps['node'];
  export let extension: NodeViewProps['extension'];
  export let selected: NodeViewProps['selected'];
  export let updateAttributes: NodeViewProps['updateAttributes'];

  let inflight = false;
  let pickerOpened = false;
  $: pickerOpened = selected;

  const { anchor, floating } = createFloatingActions({
    placement: 'bottom-start',
    offset: 8,
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
    <Img
      style={css.raw({ width: 'screen' })}
      alt=""
      placeholder={node.attrs.placeholder}
      progressive
      ratio={node.attrs.ratio}
      size="full"
      url={node.attrs.url}
    />
  {:else}
    <div class={css({ backgroundColor: 'neutral.20', padding: '12px' })} use:anchor>
      {#if inflight}
        업로드 중...
      {:else}
        이미지
      {/if}
    </div>
  {/if}
</NodeView>

{#if pickerOpened && !node.attrs.id && !inflight}
  <div class={css({ backgroundColor: 'neutral.10', paddingX: '36px', paddingY: '12px' })} use:floating>
    <Button on:click={handleUpload}>업로드</Button>
  </div>
{/if}
