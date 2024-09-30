<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { createEventDispatcher } from 'svelte';

  export let defaultValue: string | undefined = undefined;
  export let items: {
    label: string;
    value: string;
  }[] = [];

  let selectedValue = defaultValue ?? items[0].value;
  const dispatch = createEventDispatcher<{
    select: string;
  }>();
  $: dispatch('select', selectedValue);

  $: selectedIndex = items.findIndex((item) => item.value === selectedValue);
</script>

<div
  class={flex({
    position: 'relative',
    gap: '4px',
    padding: '4px',
    borderRadius: '10px',
    backgroundColor: 'neutral.20',
  })}
>
  <div
    style:left={`calc(4px + ${selectedIndex} * ((100% - ${4 * (items.length + 1)}px) / ${items.length} + 4px))`}
    style:width={`calc((100% - ${4 * (items.length + 1)}px) / ${items.length})`}
    class={css({
      position: 'absolute',
      height: '36px',
      borderRadius: '6px',
      background: 'white',
      borderWidth: '1px',
      borderColor: 'border.secondary',
      transition: '[left 100ms cubic-bezier(0.3, 0, 0, 1)]',
    })}
    aria-hidden="true"
  />

  {#each items as item (item.value)}
    <button
      class={css({
        flex: '1',
        height: '36px',
        textStyle: '16m',
        zIndex: '1',
        color: 'text.tertiary',
        _selected: {
          color: 'text.primary',
        },
      })}
      aria-selected={selectedValue === item.value}
      role="tab"
      type="button"
      on:click={() => (selectedValue = item.value)}
    >
      {item.label}
    </button>
  {/each}
</div>
