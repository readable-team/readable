<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { createFloatingActions } from '@readable/ui/actions';
  import { NodeView, NodeViewContentEditable } from '@readable/ui/tiptap';
  import twitterEmojis from 'emoji-datasource-twitter/emoji.json';
  import { matchSorter } from 'match-sorter';
  import { HorizontalDivider } from '../../../components';
  import Emoji from './Emoji.svelte';
  import type { NodeViewProps } from '@readable/ui/tiptap';

  type $$Props = NodeViewProps;
  $$restProps;

  export let node: NodeViewProps['node'];
  export let editor: NodeViewProps['editor'] | undefined;
  // export let selected: NodeViewProps['selected'];
  // export let deleteNode: NodeViewProps['deleteNode'];
  // export let getPos: NodeViewProps['getPos'];
  export let updateAttributes: NodeViewProps['updateAttributes'];

  const presetEmojiNames = ['exclamation', 'pushpin', 'bulb', 'loudspeaker', ''];

  const emojis = [
    ...twitterEmojis,
    {
      name: '',
      short_name: '',
      short_names: [''],
      has_img_twitter: true,
      sort_order: 0,
      sheet_x: -1,
      sheet_y: -1,
    },
  ]
    .filter((emoji) => emoji.has_img_twitter)
    .toSorted((a, b) => {
      if (presetEmojiNames.includes(a.short_name) && presetEmojiNames.includes(b.short_name)) {
        return presetEmojiNames.indexOf(a.short_name) - presetEmojiNames.indexOf(b.short_name);
      }

      if (presetEmojiNames.includes(a.short_name) && !presetEmojiNames.includes(b.short_name)) {
        return -1;
      }

      if (presetEmojiNames.includes(b.short_name) && !presetEmojiNames.includes(a.short_name)) {
        return 1;
      }

      return a.sort_order - b.sort_order;
    });

  $: emoji = findEmoji(node.attrs.emoji);

  const findEmoji = (name: string) => {
    return emojis.find((e) => e.short_name === name || e.short_names.includes(name));
  };

  let emojiPickerOpened = false;
  let pickerEl: HTMLDivElement | undefined;
  let searchKeyword = '';

  $: filteredEmojis = matchSorter(emojis, searchKeyword, {
    keys: ['name', 'short_name', 'short_names', 'text', 'texts'],
    sorter: (items) => items,
  });

  $: if (pickerEl) {
    pickerEl.querySelector('[aria-pressed="true"]')?.scrollIntoView({
      block: 'center',
    });
  }

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
      borderRightRadius: '4px',
    })}
  >
    <svelte:element
      this={editor?.isEditable ? 'button' : 'div'}
      class={css(
        {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '2px',
          size: '28px',
          textStyle: '20m',
          _pressed: {
            backgroundColor: 'gray.1000/8',
          },
          _hover: {
            backgroundColor: 'gray.1000/8',
          },
        },
        !editor?.isEditable && { pointerEvents: 'none' },
      )}
      contenteditable={false}
      role={editor?.isEditable ? 'button' : 'img'}
      on:click={() => {
        if (editor) {
          emojiPickerOpened = true;
        }
      }}
      {...editor?.isEditable && {
        'type': 'button',
        'aria-pressed': emojiPickerOpened,
      }}
      use:anchor
    >
      {#if emoji?.short_name}
        <Emoji style={css.raw({ size: '20px' })} {emoji} />
      {/if}
    </svelte:element>

    {#if emojiPickerOpened}
      <div
        class={flex({
          direction: 'column',
          gap: '6px',
          borderRadius: '4px',
          padding: '5px',
          backgroundColor: 'surface.primary',
          boxShadow: 'emphasize',
          width: '280px',
          height: '280px',
        })}
        use:floating
      >
        <input
          class={css({ textStyle: '14m', padding: '6px' })}
          placeholder="검색..."
          type="text"
          bind:value={searchKeyword}
        />

        <HorizontalDivider />

        <div bind:this={pickerEl} class={flex({ gap: '6px', flexWrap: 'wrap', overflowY: 'auto' })}>
          {#each filteredEmojis as emoji (emoji.short_name)}
            <button
              class={flex({
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '2px',
                size: '28px',
                _pressed: {
                  backgroundColor: 'gray.1000/8',
                },
                _hover: {
                  backgroundColor: 'gray.1000/8',
                },
              })}
              aria-label={emoji.name}
              aria-pressed={emoji.short_name === node.attrs.emoji}
              title={emoji.name}
              type="button"
              on:click={() => {
                updateAttributes({ emoji: emoji.short_name });
                emojiPickerOpened = false;
              }}
            >
              <Emoji style={css.raw({ size: '20px' })} {emoji} />
            </button>
          {/each}
        </div>
      </div>
    {/if}
    <div class={css({ flexGrow: 1, paddingTop: '2px' })}>
      <NodeViewContentEditable />
    </div>
  </div>
</NodeView>
