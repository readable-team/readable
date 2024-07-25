<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { center, flex } from '@readable/styled-system/patterns';
  import Icon from '../../../components/Icon.svelte';
  import type { Editor, Range } from '@tiptap/core';
  import type { MenuItem, MenuItemGroup } from './types';

  export let editor: Editor;
  export let range: Range;
  export let items: MenuItem[];
  export let selectedIdx = 0;

  export const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      selectedIdx = Math.min(selectedIdx + 1, items.length - 1);
      return true;
    }

    if (event.key === 'ArrowUp') {
      selectedIdx = Math.max(selectedIdx - 1, 0);
      return true;
    }

    if (event.key === 'Enter') {
      const item = items[selectedIdx];
      if (item) {
        item.command({ editor, range });
      }

      return true;
    }

    return false;
  };

  const groupNameMap: Record<MenuItemGroup, string> = {
    heading: '제목',
    block: '블록',
  };
</script>

<div
  class={css({
    width: '300px',
    borderRadius: '4px',
    backgroundColor: 'gray.100',
    borderWidth: '1px',
    boxShadow: '[0px 4px 10px 0 {colors.gray.1000/30}]',
    padding: '4px',
  })}
>
  {#each items as item, idx (item.id)}
    {#if items[idx - 1]?.group !== item.group}
      <div class={css({ paddingX: '8px', paddingY: '6px', textStyle: '12r', color: 'gray.700' })}>
        {groupNameMap[item.group]}
      </div>
    {/if}

    <div
      class={flex({
        align: 'center',
        gap: '8px',
        paddingX: '8px',
        paddingY: '6px',
        backgroundColor: selectedIdx === idx ? 'gray.200' : undefined,
      })}
    >
      <div class={center({ size: '40px', borderRadius: '4px', backgroundColor: 'gray.200' })}>
        <Icon icon={item.icon} size={20} />
      </div>

      <div class={flex({ direction: 'column' })}>
        <div class={css({ textStyle: '15m' })}>{item.name}</div>
        <div class={css({ textStyle: '12r', color: 'gray.700' })}>{item.description}</div>
      </div>
    </div>
  {:else}
    결과가 없어요
  {/each}
</div>
