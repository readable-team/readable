<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Icon } from '@readable/ui/components';
  import { createEventDispatcher } from 'svelte';
  import MessageSquareMoreIcon from '~icons/lucide/message-square-more';
  import MessageSquarePlusIcon from '~icons/lucide/message-square-plus';

  export let pos: number;
  export let commentCount = 0;

  const dispatch = createEventDispatcher<{ click: { pos: number; anchor: HTMLElement } }>();
  let buttonEl: HTMLButtonElement;
</script>

<div class={flex({ position: 'relative', align: 'center', pointerEvents: 'auto' })}>
  <button
    bind:this={buttonEl}
    class={css({ borderRadius: '6px', padding: '2px', color: 'neutral.50', _hover: { backgroundColor: 'neutral.20' } })}
    type="button"
    on:click={() => dispatch('click', { pos, anchor: buttonEl })}
  >
    <Icon icon={commentCount > 0 ? MessageSquareMoreIcon : MessageSquarePlusIcon} size={18} />
  </button>
</div>
