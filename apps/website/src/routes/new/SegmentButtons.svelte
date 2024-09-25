<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { createEventDispatcher } from 'svelte';

  export let items: {
    label: string;
    value: string;
  }[] = [];

  let selectedValue = items[0].value;
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
    backdropFilter: '[blur(20px)]', // 이게 왜 들어가지?
  })}
>
  <div
    style:left={`${4 + selectedIndex * 98}px`}
    class={css({
      position: 'absolute',
      width: '94px',
      height: '36px',
      borderRadius: '6px',
      background: 'white/14',
      boxShadow: '[0px 3px 8px 0px rgba(0, 0, 0, 0.12), 0px 3px 1px 0px rgba(0, 0, 0, 0.04)]',
      transition: '[left 100ms cubic-bezier(0.3, 0, 0, 1)]',
    })}
    aria-hidden="true"
  />

  {#each items as item (item.value)}
    <button
      class={css({
        width: '94px',
        height: '36px',
        textStyle: '16m',
      })}
      type="button"
      on:click={() => (selectedValue = item.value)}
    >
      {item.label}
    </button>
  {/each}
</div>
