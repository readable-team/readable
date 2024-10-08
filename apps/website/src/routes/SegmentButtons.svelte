<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { createEventDispatcher } from 'svelte';

  export let variant: 'default' | 'white' = 'default';
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
    background: 'white/14',
  })}
>
  <div
    style:left={`calc(4px + ${selectedIndex} * (${100 / items.length}% - ${4 / items.length}px))`}
    class={css(
      {
        position: 'absolute',
        width: '94px',
        height: '36px',
        lgDown: {
          width: '84px',
          height: '32px',
        },
        borderRadius: '6px',
        background: 'white/14',
        boxShadow: '[0px 3px 8px 0px rgba(0, 0, 0, 0.12), 0px 3px 1px 0px rgba(0, 0, 0, 0.04)]',
        transition: '[left 100ms cubic-bezier(0.3, 0, 0, 1)]',
      },
      variant === 'white' && { background: 'white' },
    )}
    aria-hidden="true"
  />

  {#each items as item (item.value)}
    <button
      class={css(
        {
          width: '94px',
          height: '36px',
          textStyle: '16m',
          zIndex: '1',
          lgDown: {
            width: '84px',
            height: '32px',
            textStyle: '14m',
          },
        },
        variant === 'white' && selectedValue === item.value && { color: 'text.primary' },
      )}
      type="button"
      on:click={() => (selectedValue = item.value)}
    >
      {item.label}
    </button>
  {/each}
</div>
