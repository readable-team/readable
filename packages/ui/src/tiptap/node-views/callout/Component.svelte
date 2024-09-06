<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { createFloatingActions } from '@readable/ui/actions';
  import { NodeView, NodeViewContentEditable } from '@readable/ui/tiptap';
  import LightBulbIcon from '../../../assets/light-bulb.svg?component';
  import LoudspeakerIcon from '../../../assets/loudspeaker.svg?component';
  import PushpinIcon from '../../../assets/pushpin.svg?component';
  import RedExclamationMarkIcon from '../../../assets/red-exclamation-mark.svg?component';
  import { Icon } from '../../../components';
  import type { NodeViewProps } from '@readable/ui/tiptap';
  import type { ComponentType } from 'svelte';

  type $$Props = NodeViewProps;
  $$restProps;

  export let node: NodeViewProps['node'];
  // export let editor: NodeViewProps['editor'] | undefined;
  // export let selected: NodeViewProps['selected'];
  // export let deleteNode: NodeViewProps['deleteNode'];
  // export let getPos: NodeViewProps['getPos'];
  export let updateAttributes: NodeViewProps['updateAttributes'];

  const EmojiMap = new Map<string, ComponentType>([
    ['alert', RedExclamationMarkIcon],
    ['pin', PushpinIcon],
    ['lightbulb', LightBulbIcon],
    ['loudspeaker', LoudspeakerIcon],
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

<NodeView>
  <div
    class={flex({
      gap: '7px',
      borderLeftWidth: '3px',
      borderColor: 'var(--usersite-theme-color)',
      backgroundColor: 'var(--usersite-theme-color)/4',
      paddingLeft: '14px',
      paddingRight: '16px',
      paddingY: '16px',
    })}
  >
    <button
      class={flex({
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '2px',
        size: '28px',
        textStyle: '20m',
        _pressed: {
          backgroundColor: 'gray.1000/10',
        },
        _hover: {
          backgroundColor: 'gray.1000/10',
        },
      })}
      aria-pressed={emojiPickerOpened}
      contenteditable={false}
      type="button"
      on:click={() => {
        emojiPickerOpened = true;
      }}
      use:anchor
    >
      {#if emoji}
        <Icon icon={emoji} />
      {/if}
    </button>
    {#if emojiPickerOpened}
      <div
        class={flex({
          gap: '6px',
          borderRadius: '4px',
          padding: '5px',
          backgroundColor: 'surface.primary',
          boxShadow: 'emphasize',
        })}
        use:floating
      >
        {#each EmojiMap as [emojiKey, emoji] (emojiKey)}
          <button
            class={flex({
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '2px',
              size: '28px',
              textStyle: '20m',
              _pressed: {
                backgroundColor: 'gray.1000/10',
              },
              _hover: {
                backgroundColor: 'gray.1000/10',
              },
            })}
            aria-pressed={emojiKey === node.attrs.emoji}
            type="button"
            on:click={() => {
              updateAttributes({ emoji: emojiKey });
              emojiPickerOpened = false;
            }}
          >
            <Icon icon={emoji} />
          </button>
        {/each}
      </div>
    {/if}
    <div class={css({ paddingTop: '3px' })}>
      <NodeViewContentEditable />
    </div>
  </div>
</NodeView>
