<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { createEventDispatcher } from 'svelte';

  export let defaultValue: 'MONTHLY' | 'YEARLY' = 'MONTHLY';

  let selectedValue = defaultValue;
  const dispatch = createEventDispatcher<{
    select: 'MONTHLY' | 'YEARLY';
  }>();
  $: dispatch('select', selectedValue);

  $: selectedIndex = selectedValue === 'MONTHLY' ? 0 : 1;

  const length = 2;
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
    style:left={`calc(4px + ${selectedIndex} * ((100% - ${4 * (length + 1)}px) / ${length} + 4px))`}
    style:width={`calc((100% - ${4 * (length + 1)}px) / ${length})`}
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
    aria-selected={selectedValue === 'MONTHLY'}
    role="tab"
    type="button"
    on:click={() => (selectedValue = 'MONTHLY')}
  >
    월 결제
  </button>
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
    aria-selected={selectedValue === 'YEARLY'}
    role="tab"
    type="button"
    on:click={() => (selectedValue = 'YEARLY')}
  >
    <div class={flex({ position: 'relative', gap: '8px', alignItems: 'center', justifyContent: 'center' })}>
      <span>연 결제</span>
      <div
        class={css({
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          textStyle: '11b',
          color: 'white',
          borderRadius: '4px',
          paddingX: '4px',
          paddingY: '2px',
          backgroundColor: 'accent.60',
        })}
      >
        30% 할인
      </div>
    </div>
  </button>
</div>
