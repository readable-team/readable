<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { center, flex } from '@readable/styled-system/patterns';
  import { HorizontalDivider, Icon } from '@readable/ui/components';
  import { createEventDispatcher } from 'svelte';
  import type { Editor, Range } from '@tiptap/core';
  import type { MenuItem, MenuItemGroup } from './types';

  export let editor: Editor;
  export let range: Range;
  export let items: MenuItem[];
  export let selectedIdx = 0;

  const dispatch = createEventDispatcher<{ select: MenuItem }>();

  $: dispatch('select', items[selectedIdx]);

  let isOnKeyboardNavigation = false;

  export const handleKeyDown = (event: KeyboardEvent) => {
    if (['ArrowDown', 'ArrowUp'].includes(event.key)) {
      event.preventDefault();
      isOnKeyboardNavigation = true;

      if (event.key === 'ArrowDown') {
        selectedIdx = (selectedIdx + 1) % items.length;
      }

      if (event.key === 'ArrowUp') {
        selectedIdx = (selectedIdx - 1 + items.length) % items.length;
      }

      selectableElems[selectedIdx]?.focus();
      return true;
    }

    isOnKeyboardNavigation = false;
    if (!editor.view.hasFocus()) {
      editor.view.focus();
    }
    return false;
  };

  const groupNameMap: Record<MenuItemGroup, string> = {
    heading: '제목',
    block: '블록',
    media: '미디어',
  };

  let selectableElems: HTMLElement[] = [];
</script>

<div
  class={flex({
    direction: 'column',
    gap: '2px',
    width: '260px',
    maxHeight: '340px',
    overflow: 'auto',
    borderRadius: '8px',
    backgroundColor: 'surface.tertiary',
    borderWidth: '1px',
    borderColor: 'border.primary',
    boxShadow: 'heavy',
    paddingLeft: '4px',
    paddingRight: '6px',
    paddingY: '10px',
  })}
  role="menu"
>
  {#each items as item, idx (item.id)}
    {#if items[idx - 1]?.group !== item.group}
      {#if idx !== 0}
        <HorizontalDivider
          style={css.raw({
            marginY: '10px',
            marginLeft: '-4px',
            marginRight: '-6px',
          })}
          color="secondary"
        />
      {/if}
      <div class={css({ paddingX: '8px', textStyle: '12b', marginBottom: '2px', color: 'text.tertiary' })}>
        {groupNameMap[item.group]}
      </div>
    {/if}

    <div
      bind:this={selectableElems[idx]}
      class={flex({
        align: 'center',
        gap: '10px',
        paddingX: '8px',
        paddingY: '5px',
        borderRadius: '6px',
        backgroundColor: selectedIdx === idx ? 'neutral.10' : undefined,
      })}
      role="menuitem"
      tabindex="-1"
      on:pointermove={() => {
        if (isOnKeyboardNavigation) {
          isOnKeyboardNavigation = false;
        } else {
          selectedIdx = idx;
        }
      }}
      on:click={() => item.command({ editor, range })}
      on:keydown={handleKeyDown}
    >
      <div
        class={center({
          width: '48px',
          height: '48px',
          borderRadius: '8px',
          backgroundColor: 'surface.primary',
          borderColor: 'border.secondary',
          borderWidth: '1px',
        })}
      >
        <Icon icon={item.icon} size={20} />
      </div>

      <div class={flex({ direction: 'column' })}>
        <div class={css({ textStyle: '14sb' })}>{item.name}</div>
        <div class={css({ textStyle: '13m', color: 'text.secondary' })}>{item.description}</div>
      </div>
    </div>
  {:else}
    <div class={css({ paddingX: '8px', color: 'text.tertiary', textStyle: '14sb' })}>결과 없음</div>
  {/each}
</div>
