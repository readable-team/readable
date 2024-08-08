<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { createFloatingActions } from '@readable/ui/actions';
  import { NodeView, NodeViewContentEditable } from '@readable/ui/tiptap';
  import type { NodeViewProps } from '@readable/ui/tiptap';

  type $$Props = NodeViewProps;
  $$restProps;

  export let node: NodeViewProps['node'];
  // export let editor: NodeViewProps['editor'] | undefined;
  // export let selected: NodeViewProps['selected'];
  // export let deleteNode: NodeViewProps['deleteNode'];
  // export let getPos: NodeViewProps['getPos'];
  export let updateAttributes: NodeViewProps['updateAttributes'];

  const EmojiMap = new Map([
    ['alert', '❗'],
    ['pin', '📌'],
    ['lightbulb', '💡'],
    ['loudspeaker', '📢'],
  ] as const);

  $: emoji = EmojiMap.get(node.attrs.emoji);

  let emojiPickerOpened = false;

  const { anchor, floating } = createFloatingActions({
    placement: 'bottom-end',
    offset: 8,
    onClickOutside: () => {
      emojiPickerOpened = false;
    },
  });
</script>

<NodeView draggable>
  <div
    class={flex({
      gap: '7px',
      borderRadius: '10px',
      backgroundColor: 'neutral.10',
      paddingX: '28px',
      paddingY: '20px',
    })}
  >
    <button
      class={flex({
        width: '30px',
        height: '30px',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '6px',
        textStyle: '20m',
        _pressed: {
          backgroundColor: 'neutral.50',
        },
        _hover: {
          backgroundColor: 'neutral.40',
        },
      })}
      aria-pressed={emojiPickerOpened}
      type="button"
      on:click={() => {
        emojiPickerOpened = true;
      }}
      use:anchor
    >
      {emoji}
    </button>
    {#if emojiPickerOpened}
      <div
        class={flex({
          backgroundColor: 'surface.tertiary',
          borderRadius: '6px',
          boxShadow: 'heavy',
          gap: '4px',
          padding: '5px',
        })}
        use:floating
      >
        {#each EmojiMap.keys() as emojiKey (emojiKey)}
          <button
            class={flex({
              width: '30px',
              height: '30px',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '6px',
              textStyle: '20m',
              _hover: {
                backgroundColor: 'neutral.10',
              },
              _pressed: {
                backgroundColor: 'neutral.20',
              },
            })}
            aria-pressed={emojiKey === node.attrs.emoji}
            type="button"
            on:click={() => {
              updateAttributes({ emoji: emojiKey });
              emojiPickerOpened = false;
            }}
          >
            {EmojiMap.get(emojiKey)}
          </button>
        {/each}
      </div>
    {/if}
    <div class={css({ paddingTop: '3px' })}>
      <NodeViewContentEditable />
    </div>
  </div>
</NodeView>
