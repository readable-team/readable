<script lang="ts">
  import { flex } from '@readable/styled-system/patterns';
  import { Icon } from '@readable/ui/components';
  import ArrowUpRightIcon from '~icons/lucide/arrow-up-right';
  import { isPlanUpgradeModalOpen, isPro } from '$lib/svelte/stores/ui';
</script>

{#if !$isPro}
  <button
    class={flex({
      marginLeft: '8px',
      alignItems: 'center',
      gap: '2px',
      textStyle: '11sb',
      color: 'text.accent',
      backgroundColor: 'accent.10',
      borderRadius: '4px',
      height: '20px',
      paddingLeft: '6px',
      paddingRight: '4px',
    })}
    type="button"
    on:click={() => {
      isPlanUpgradeModalOpen.set(true);
    }}
  >
    <span>PRO</span>
    <Icon icon={ArrowUpRightIcon} size={12} />
  </button>
{/if}
