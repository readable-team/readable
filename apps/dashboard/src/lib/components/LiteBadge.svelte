<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { Icon } from '@readable/ui/components';
  import mixpanel from 'mixpanel-browser';
  import ArrowUpRightIcon from '~icons/lucide/arrow-up-right';
  import { LitePlan } from '$assets/plan';
  import { isLiteOrHigher, isPlanUpgradeModalOpen, selectedPlan } from '$lib/svelte/stores/ui';
  import type { SystemStyleObject } from '@readable/styled-system/types';

  export let via: string;
  export let style: SystemStyleObject | undefined = undefined;
</script>

{#if !$isLiteOrHigher}
  <button
    class={css(
      {
        display: 'flex',
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
      },
      style,
    )}
    type="button"
    on:click={() => {
      mixpanel.track('plan:upgrade:show', { via });
      selectedPlan.set(LitePlan);
      isPlanUpgradeModalOpen.set(true);
    }}
  >
    <span>Lite</span>
    <Icon icon={ArrowUpRightIcon} size={12} />
  </button>
{/if}
